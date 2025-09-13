-- Simplified Unified Data Models Migration
-- Adds core tables for the modular plugin architecture

-- Feature Flags system
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0,
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  target_companies UUID[] NOT NULL DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit Log for system tracking
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  company_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System Health monitoring
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  error_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  last_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migration Records
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

-- Localization
CREATE TABLE IF NOT EXISTS public.localization_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, locale)
);

-- Add check constraints where needed
DO $$ 
BEGIN
  -- Add constraints to feature_flags if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feature_flags_rollout_check') THEN
    ALTER TABLE public.feature_flags ADD CONSTRAINT feature_flags_rollout_check 
    CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100);
  END IF;
  
  -- Add constraints to system_health if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_health_status_check') THEN
    ALTER TABLE public.system_health ADD CONSTRAINT system_health_status_check 
    CHECK (status IN ('healthy', 'degraded', 'down'));
  END IF;
  
  -- Add constraints to localization_entries if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'localization_locale_check') THEN
    ALTER TABLE public.localization_entries ADD CONSTRAINT localization_locale_check 
    CHECK (locale IN ('no', 'en', 'se', 'dk'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON public.feature_flags(is_enabled);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON public.audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_system_health_service ON public.system_health(service);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON public.system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_last_check ON public.system_health(last_check);

CREATE INDEX IF NOT EXISTS idx_localization_key ON public.localization_entries(key);
CREATE INDEX IF NOT EXISTS idx_localization_locale ON public.localization_entries(locale);

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localization_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags (admin only)
DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for audit_log (admin only)
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for system_health (admin only)
DROP POLICY IF EXISTS "Admins can view system health" ON public.system_health;
CREATE POLICY "Admins can view system health" ON public.system_health
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for migration_records (admin only)
DROP POLICY IF EXISTS "Admins can view migration records" ON public.migration_records;
CREATE POLICY "Admins can view migration records" ON public.migration_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'master_admin')
    )
  );

-- RLS Policies for localization_entries (public read, editor write)
DROP POLICY IF EXISTS "Everyone can view localization entries" ON public.localization_entries;
CREATE POLICY "Everyone can view localization entries" ON public.localization_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content editors can manage localization" ON public.localization_entries;
CREATE POLICY "Content editors can manage localization" ON public.localization_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('content_editor', 'admin', 'master_admin')
    )
  );

-- Update triggers for timestamps
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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
('properties.title', 'en', 'Properties'),
('navigation.home', 'no', 'Hjem'),
('navigation.home', 'en', 'Home'),
('navigation.leads', 'no', 'Kundeemner'),
('navigation.leads', 'en', 'Leads'),
('navigation.properties', 'no', 'Eiendommer'),
('navigation.properties', 'en', 'Properties'),
('navigation.dashboard', 'no', 'Kontrollpanel'),
('navigation.dashboard', 'en', 'Dashboard')
ON CONFLICT (key, locale) DO NOTHING;

-- Record this migration
INSERT INTO public.migration_records (version, description, execution_time_ms, success, rollback_available) VALUES
('2025.01.003', 'Core unified data models setup', 0, true, true)
ON CONFLICT (version) DO NOTHING;