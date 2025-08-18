-- Phase 1: Unified Data Models Migration
-- This migration implements the unified role system and data models

-- 1. First, update the app_role enum to include all canonical roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'guest';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'company';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'master_admin';

-- 2. Create module_metadata table for plugin-driven architecture
CREATE TABLE IF NOT EXISTS public.module_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    dependencies TEXT[] DEFAULT '{}',
    feature_flags JSONB DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create feature_flags table (if not exists)
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_roles app_role[] DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enhance user_profiles table to match unified schema
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS feature_overrides JSONB DEFAULT '{}';

-- 5. Enhance company_profiles table 
ALTER TABLE public.company_profiles 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS feature_overrides JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 6. Update user_roles table to use the new canonical roles
-- First, update existing 'member' roles to 'user'
UPDATE public.user_roles 
SET role = 'user'::app_role 
WHERE role = 'member'::app_role;

-- Add anonymous roles as 'guest' (for completeness, though guests typically won't have DB records)
-- This is mainly for testing and edge cases

-- 7. Create security definer function for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 8. Create helper function to get user's highest role level
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(MAX(
    CASE 
      WHEN role = 'master_admin' THEN 100
      WHEN role = 'admin' THEN 80
      WHEN role = 'content_editor' THEN 60
      WHEN role = 'company' THEN 40
      WHEN role = 'user' THEN 20
      WHEN role = 'guest' THEN 0
      ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- 9. Create function to check if user has minimum role level
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level
$$;

-- 10. Enable RLS on new tables
ALTER TABLE public.module_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for module_metadata
CREATE POLICY "Module metadata viewable by authenticated users"
ON public.module_metadata
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage module metadata"
ON public.module_metadata
FOR ALL
TO authenticated
USING (public.has_role_level(auth.uid(), 80)); -- admin level

-- 12. Create RLS policies for feature_flags
CREATE POLICY "Feature flags viewable by authenticated users"
ON public.feature_flags
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage feature flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.has_role_level(auth.uid(), 80)); -- admin level

-- 13. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables that need them
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_profiles_updated_at ON public.company_profiles;
CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_module_metadata_updated_at ON public.module_metadata;
CREATE TRIGGER update_module_metadata_updated_at
  BEFORE UPDATE ON public.module_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Insert initial module metadata for existing modules
INSERT INTO public.module_metadata (name, description, version, dependencies, active) VALUES
  ('auth', 'Authentication and user management module', '1.0.0', '{}', true),
  ('admin', 'Administrative tools and user management', '1.0.0', '{"auth"}', true),
  ('lead-gen', 'Lead generation and comparison engine', '1.0.0', '{"auth"}', true),
  ('doc-mgmt', 'Home documentation and maintenance', '1.0.0', '{"auth"}', true),
  ('listings', 'Real estate listings management', '1.0.0', '{"auth"}', true),
  ('payments', 'Payment processing and subscriptions', '1.0.0', '{"auth"}', true)
ON CONFLICT (name) DO NOTHING;

-- 15. Insert initial feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, target_roles) VALUES
  ('advanced_admin_tools', 'Advanced administrative tools and reporting', true, '{"admin", "master_admin"}'),
  ('lead_analytics', 'Advanced lead analytics and insights', true, '{"company", "admin", "master_admin"}'),
  ('beta_features', 'Access to beta features and experimental tools', false, '{"master_admin"}'),
  ('bulk_operations', 'Bulk operations for data management', true, '{"admin", "master_admin"}'),
  ('api_access', 'Access to API endpoints for integrations', false, '{"company", "admin", "master_admin"}')
ON CONFLICT (name) DO NOTHING;