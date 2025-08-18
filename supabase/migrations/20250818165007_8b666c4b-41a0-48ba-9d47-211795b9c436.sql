-- Phase 1: Unified Data Models Migration (Corrected)
-- This migration implements the unified role system and data models

-- 1. First, update the app_role enum to include all canonical roles
DO $$
BEGIN
    -- Add new enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'guest' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'guest';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'company' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'company';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'content_editor' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'content_editor';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'admin';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'master_admin' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE public.app_role ADD VALUE 'master_admin';
    END IF;
END
$$;

-- 2. Update user_roles table to use the new canonical roles
UPDATE public.user_roles 
SET role = 'user'::app_role 
WHERE role = 'member'::app_role;

-- 3. Create helper function to get user's highest role level
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

-- 4. Create function to check if user has minimum role level
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level
$$;

-- 5. Insert initial module metadata for existing modules
INSERT INTO public.module_metadata (name, description, version, dependencies, active) VALUES
  ('auth', 'Authentication and user management module', '1.0.0', '{}', true),
  ('admin', 'Administrative tools and user management', '1.0.0', '{"auth"}', true),
  ('lead-gen', 'Lead generation and comparison engine', '1.0.0', '{"auth"}', true),
  ('doc-mgmt', 'Home documentation and maintenance', '1.0.0', '{"auth"}', true),
  ('listings', 'Real estate listings management', '1.0.0', '{"auth"}', true),
  ('payments', 'Payment processing and subscriptions', '1.0.0', '{"auth"}', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  version = EXCLUDED.version,
  dependencies = EXCLUDED.dependencies,
  updated_at = now();

-- 6. Update existing feature flags to use new role system
UPDATE public.feature_flags 
SET target_roles = ARRAY['admin', 'master_admin']::text[]
WHERE name = 'advanced_admin_tools' AND target_roles != ARRAY['admin', 'master_admin']::text[];

UPDATE public.feature_flags 
SET target_roles = ARRAY['company', 'admin', 'master_admin']::text[]
WHERE name = 'lead_analytics' AND target_roles != ARRAY['company', 'admin', 'master_admin']::text[];

-- 7. Update RLS policies to use new helper functions
DROP POLICY IF EXISTS "Only admins can manage module metadata" ON public.module_metadata;
CREATE POLICY "Only admins can manage module metadata"
ON public.module_metadata
FOR ALL
TO authenticated
USING (public.has_role_level(auth.uid(), 80)); -- admin level

DROP POLICY IF EXISTS "Only admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Only admins can manage feature flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.has_role_level(auth.uid(), 80)); -- admin level

-- 8. Add validation to ensure role consistency
CREATE OR REPLACE FUNCTION public.validate_user_role_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the role is a canonical role
  IF NEW.role NOT IN ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be one of: guest, user, company, content_editor, admin, master_admin', NEW.role;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role validation
DROP TRIGGER IF EXISTS user_roles_validate_consistency ON public.user_roles;
CREATE TRIGGER user_roles_validate_consistency
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_role_consistency();