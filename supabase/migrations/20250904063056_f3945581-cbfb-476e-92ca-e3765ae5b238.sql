-- Initialize Homni Core Infrastructure
-- Creates foundational tables for Master Prompt compliance

-- Create core feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on feature_flags (if not already enabled)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feature_flags'
  ) THEN
    ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies for feature_flags (authenticated can view, admins can manage)
CREATE POLICY "Authenticated users can view feature flags"
  ON public.feature_flags FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify feature flags"
  ON public.feature_flags FOR ALL
  USING (has_role_level(auth.uid(), 80))
  WITH CHECK (has_role_level(auth.uid(), 80));

-- Create module metadata table (if not exists)
CREATE TABLE IF NOT EXISTS public.module_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT NOT NULL,
  dependencies TEXT[] NOT NULL DEFAULT '{}',
  feature_flags JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on module_metadata (if not already enabled)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'module_metadata' AND policyname = 'Authenticated users can view module metadata'
  ) THEN
    ALTER TABLE public.module_metadata ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Authenticated users can view module metadata"
      ON public.module_metadata FOR SELECT 
      USING (auth.uid() IS NOT NULL);

    CREATE POLICY "Only admins can manage module metadata"
      ON public.module_metadata FOR ALL
      USING (has_role_level(auth.uid(), 80))
      WITH CHECK (has_role_level(auth.uid(), 80));
  END IF;
END $$;

-- Insert initial feature flags for Homni modules
INSERT INTO public.feature_flags (name, description, is_enabled, target_roles) VALUES 
  ('leads-module', 'Enable Bytt.no-style lead generation and marketplace', true, '{"user","company","admin","master_admin"}'),
  ('boligmappa-module', 'Enable Boligmappa.no-style property documentation', true, '{"user","admin","master_admin"}'),
  ('propr-module', 'Enable Propr.no-style DIY selling features', false, '{"user","admin","master_admin"}'),
  ('ai-integration', 'Enable AI-powered features across modules', false, '{"user","company","admin","master_admin"}'),
  ('advanced-analytics', 'Enable advanced analytics and BI features', true, '{"admin","master_admin"}'),
  ('lead-marketplace', 'Enable lead buying/selling marketplace', true, '{"company","admin","master_admin"}')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();

-- Insert core module metadata  
INSERT INTO public.module_metadata (name, description, version, dependencies, active) VALUES
  ('leads', 'Bytt.no-style lead generation and matching system', '1.0.0', '{}', true),
  ('boligmappa', 'Property documentation and maintenance tracking', '1.0.0', '{}', true), 
  ('propr', 'DIY property selling workflow (future)', '0.1.0', '{"leads"}', false),
  ('marketplace', 'Lead buying and distribution system', '1.0.0', '{"leads"}', true),
  ('analytics', 'Business intelligence and reporting', '1.0.0', '{}', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  version = EXCLUDED.version,
  updated_at = now();

-- Create trigger functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_feature_flags_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feature_flags_updated_at') THEN
    CREATE TRIGGER update_feature_flags_updated_at
      BEFORE UPDATE ON public.feature_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.update_feature_flags_updated_at();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_module_metadata_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_module_metadata_updated_at') THEN
    CREATE TRIGGER update_module_metadata_updated_at
      BEFORE UPDATE ON public.module_metadata
      FOR EACH ROW
      EXECUTE FUNCTION public.update_module_metadata_updated_at();
  END IF;
END $$;