-- Unified Data Models Migration
-- Creates tables for the modular plugin architecture

-- User Profiles with unified structure
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('anonymous', 'user', 'company', 'content_editor', 'admin', 'master_admin')),
  account_type TEXT NOT NULL CHECK (account_type IN ('privatperson', 'bedrift')),
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  notification_preferences JSONB NOT NULL DEFAULT '{
    "email": true,
    "sms": false,
    "push": true,
    "marketing": false,
    "system": true
  }'::jsonb,
  ui_preferences JSONB NOT NULL DEFAULT '{
    "theme": "system",
    "language": "no",
    "dashboard_layout": "standard",
    "preferred_modules": [],
    "quick_actions": []
  }'::jsonb,
  feature_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(user_id)
);

-- Company Profiles with unified structure
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  org_number TEXT UNIQUE,
  industry TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  notification_preferences JSONB NOT NULL DEFAULT '{
    "email": true,
    "sms": false,
    "webhook": null,
    "slack": null
  }'::jsonb,
  ui_preferences JSONB NOT NULL DEFAULT '{
    "branding": {
      "logo_url": null,
      "primary_color": null,
      "secondary_color": null
    },
    "dashboard_config": {
      "default_view": "overview",
      "widgets": []
    }
  }'::jsonb,
  feature_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Module Metadata for plugin system
CREATE TABLE public.module_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT NOT NULL,
  dependencies TEXT[] NOT NULL DEFAULT '{}',
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  module_type TEXT NOT NULL CHECK (module_type IN ('core', 'plugin', 'integration')),
  entry_point TEXT NOT NULL,
  config_schema JSONB,
  permissions_required TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature Flags system
CREATE TABLE public.feature_flags (
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

-- Module Access Control
CREATE TABLE public.module_access (
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

-- Audit Log for system tracking
CREATE TABLE public.audit_log (
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

-- System Health monitoring
CREATE TABLE public.system_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  error_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  last_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Metrics
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  labels JSONB
);

-- Migration Records
CREATE TABLE public.migration_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  rollback_available BOOLEAN NOT NULL DEFAULT false
);

-- Localization
CREATE TABLE public.localization_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('no', 'en', 'se', 'dk')),
  value TEXT NOT NULL,
  context TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, locale)
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX idx_user_profiles_deleted_at ON public.user_profiles(deleted_at);

CREATE INDEX idx_company_profiles_org_number ON public.company_profiles(org_number);
CREATE INDEX idx_company_profiles_subscription_tier ON public.company_profiles(subscription_tier);
CREATE INDEX idx_company_profiles_deleted_at ON public.company_profiles(deleted_at);

CREATE INDEX idx_module_metadata_name ON public.module_metadata(name);
CREATE INDEX idx_module_metadata_active ON public.module_metadata(active);
CREATE INDEX idx_module_metadata_module_type ON public.module_metadata(module_type);

CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_feature_flags_is_enabled ON public.feature_flags(is_enabled);

CREATE INDEX idx_module_access_module_id ON public.module_access(module_id);
CREATE INDEX idx_module_access_user_id ON public.module_access(user_id);
CREATE INDEX idx_module_access_company_id ON public.module_access(company_id);
CREATE INDEX idx_module_access_role ON public.module_access(role);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_company_id ON public.audit_log(company_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_resource_type ON public.audit_log(resource_type);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

CREATE INDEX idx_system_health_service ON public.system_health(service);
CREATE INDEX idx_system_health_status ON public.system_health(status);
CREATE INDEX idx_system_health_last_check ON public.system_health(last_check);

CREATE INDEX idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);

CREATE INDEX idx_localization_key ON public.localization_entries(key);
CREATE INDEX idx_localization_locale ON public.localization_entries(locale);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localization_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for company_profiles
CREATE POLICY "Company members can view company profile" ON public.company_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.company_id = id
    )
  );

CREATE POLICY "Company admins can update company profile" ON public.company_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.company_id = id 
      AND up.role IN ('company', 'admin', 'master_admin')
    )
  );

-- RLS Policies for module_metadata (public read, admin write)
CREATE POLICY "Everyone can view active modules" ON public.module_metadata
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage modules" ON public.module_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

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

-- RLS Policies for performance_metrics (admin only)
CREATE POLICY "Admins can view performance metrics" ON public.performance_metrics
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

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_metadata_updated_at
  BEFORE UPDATE ON public.module_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_access_updated_at
  BEFORE UPDATE ON public.module_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert core modules
INSERT INTO public.module_metadata (name, description, version, module_type, entry_point, permissions_required) VALUES
('auth', 'Core authentication and authorization', '1.0.0', 'core', './modules/auth/index.ts', ARRAY['auth:read', 'auth:write']),
('leads', 'Lead management and distribution', '1.0.0', 'core', './modules/leads/index.ts', ARRAY['leads:read', 'leads:write']),
('properties', 'Property management', '1.0.0', 'core', './modules/properties/index.ts', ARRAY['properties:read', 'properties:write']),
('dashboard', 'Dashboard and analytics', '1.0.0', 'core', './modules/dashboard/index.ts', ARRAY['dashboard:read']),
('notifications', 'Notification system', '1.0.0', 'core', './modules/notifications/index.ts', ARRAY['notifications:read']);

-- Insert feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage, target_roles) VALUES
('advanced_search', 'Advanced search functionality', true, 100, ARRAY['user', 'company', 'admin']),
('ai_insights', 'AI-powered insights and recommendations', false, 20, ARRAY['company', 'admin']),
('mobile_app', 'Mobile application access', true, 100, ARRAY['user', 'company']),
('api_access', 'REST API access', false, 0, ARRAY['company', 'admin']),
('white_label', 'White label branding', false, 0, ARRAY['company']);

-- Insert localization entries
INSERT INTO public.localization_entries (key, locale, value) VALUES
('dashboard.title', 'no', 'Dashboard'),
('dashboard.title', 'en', 'Dashboard'),
('leads.title', 'no', 'Leads'),
('leads.title', 'en', 'Leads'),
('properties.title', 'no', 'Eiendommer'),
('properties.title', 'en', 'Properties');

-- Record this migration
INSERT INTO public.migration_records (version, description, execution_time_ms, success, rollback_available) VALUES
('2025.01.001', 'Unified data models and plugin architecture', 0, true, true);