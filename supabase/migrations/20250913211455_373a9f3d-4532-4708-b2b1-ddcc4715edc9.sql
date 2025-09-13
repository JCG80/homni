-- Unified Data Models Migration (Incremental)
-- Adds missing tables for the modular plugin architecture

-- Feature Flags system (new table)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  target_companies UUID[] NOT NULL DEFAULT '{}',
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Module Access Control (new table)
CREATE TABLE IF NOT EXISTS public.module_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.module_metadata(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('anonymous', 'user', 'company', 'content_editor', 'admin', 'master_admin')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  restrictions JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR company_id IS NOT NULL OR role IS NOT NULL)
);

-- Audit Log for system tracking (new table)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System Health monitoring (new table)
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  error_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  last_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migration Records (new table)
CREATE TABLE IF NOT EXISTS public.migration_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  rollback_available BOOLEAN NOT NULL DEFAULT false
);

-- Localization (new table)
CREATE TABLE IF NOT EXISTS public.localization_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('no', 'en', 'se', 'dk')),
  value TEXT NOT NULL,
  context TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, locale)
);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add columns to user_profiles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'display_name') THEN
    ALTER TABLE public.user_profiles ADD COLUMN display_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'account_type') THEN
    ALTER TABLE public.user_profiles ADD COLUMN account_type TEXT CHECK (account_type IN ('privatperson', 'bedrift'));
  END IF;

  -- Add columns to company_profiles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'company_name') THEN
    ALTER TABLE public.company_profiles ADD COLUMN company_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'org_number') THEN
    ALTER TABLE public.company_profiles ADD COLUMN org_number TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'size') THEN
    ALTER TABLE public.company_profiles ADD COLUMN size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE public.company_profiles ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise'));
  END IF;

  -- Add columns to module_metadata if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_metadata' AND column_name = 'module_type') THEN
    ALTER TABLE public.module_metadata ADD COLUMN module_type TEXT NOT NULL DEFAULT 'plugin' CHECK (module_type IN ('core', 'plugin', 'integration'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_metadata' AND column_name = 'entry_point') THEN
    ALTER TABLE public.module_metadata ADD COLUMN entry_point TEXT NOT NULL DEFAULT './index.ts';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_metadata' AND column_name = 'config_schema') THEN
    ALTER TABLE public.module_metadata ADD COLUMN config_schema JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_metadata' AND column_name = 'permissions_required') THEN
    ALTER TABLE public.module_metadata ADD COLUMN permissions_required TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Indexes for performance on new tables
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON public.feature_flags(is_enabled);

CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON public.module_access(module_id);
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON public.module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_company_id ON public.module_access(company_id);
CREATE INDEX IF NOT EXISTS idx_module_access_role ON public.module_access(role);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON public.audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON public.audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_system_health_service ON public.system_health(service);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON public.system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_last_check ON public.system_health(last_check);

CREATE INDEX IF NOT EXISTS idx_localization_key ON public.localization_entries(key);
CREATE INDEX IF NOT EXISTS idx_localization_locale ON public.localization_entries(locale);

-- Enable Row Level Security on new tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localization_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags (admin only)
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for module_access
CREATE POLICY "Users can view own module access" ON public.module_access
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.company_id = module_access.company_id
    )
  );

-- RLS Policies for audit_log (admin only)
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for system_health (admin only)
CREATE POLICY "Admins can view system health" ON public.system_health
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for migration_records (admin only)
CREATE POLICY "Admins can view migration records" ON public.migration_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for localization_entries (public read, editor write)
CREATE POLICY "Everyone can view localization entries" ON public.localization_entries
  FOR SELECT USING (true);

CREATE POLICY "Content editors can manage localization" ON public.localization_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('content_editor', 'admin', 'master_admin')
    )
  );

-- Update triggers for timestamps on new tables
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_access_updated_at
  BEFORE UPDATE ON public.module_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert core modules (ignore conflicts)
INSERT INTO public.module_metadata (name, description, version, module_type, entry_point, permissions_required) VALUES
('auth', 'Core authentication and authorization', '1.0.0', 'core', './modules/auth/index.ts', ARRAY['auth:read', 'auth:write']),
('leads', 'Lead management and distribution', '1.0.0', 'core', './modules/leads/index.ts', ARRAY['leads:read', 'leads:write']),
('properties', 'Property management', '1.0.0', 'core', './modules/properties/index.ts', ARRAY['properties:read', 'properties:write']),
('dashboard', 'Dashboard and analytics', '1.0.0', 'core', './modules/dashboard/index.ts', ARRAY['dashboard:read']),
('notifications', 'Notification system', '1.0.0', 'core', './modules/notifications/index.ts', ARRAY['notifications:read'])
ON CONFLICT (name) DO NOTHING;

-- Insert feature flags (ignore conflicts)
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage, target_roles) VALUES
('advanced_search', 'Advanced search functionality', true, 100, ARRAY['user', 'company', 'admin']),
('ai_insights', 'AI-powered insights and recommendations', false, 20, ARRAY['company', 'admin']),
('mobile_app', 'Mobile application access', true, 100, ARRAY['user', 'company']),
('api_access', 'REST API access', false, 0, ARRAY['company', 'admin']),
('white_label', 'White label branding', false, 0, ARRAY['company'])
ON CONFLICT (name) DO NOTHING;

-- Insert localization entries (ignore conflicts)
INSERT INTO public.localization_entries (key, locale, value) VALUES
('dashboard.title', 'no', 'Dashboard'),
('dashboard.title', 'en', 'Dashboard'),
('leads.title', 'no', 'Leads'),
('leads.title', 'en', 'Leads'),
('properties.title', 'no', 'Eiendommer'),
('properties.title', 'en', 'Properties')
ON CONFLICT (key, locale) DO NOTHING;

-- Record this migration
INSERT INTO public.migration_records (version, description, execution_time_ms, success, rollback_available) VALUES
('2025.01.002', 'Unified data models incremental update', 0, true, true)
ON CONFLICT (version) DO NOTHING;