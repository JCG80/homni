-- Fix critical security issues: Tighten RLS policies for admin tables (safe version)
-- Remove anonymous access from sensitive admin tables

-- Add explicit deny policies for anonymous users on admin tables
DO $$
BEGIN
  -- Deny anonymous access to admin_actions_log
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to admin_actions_log' AND tablename = 'admin_actions_log'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to admin_actions_log" ON public.admin_actions_log FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to admin_audit_log
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to admin_audit_log' AND tablename = 'admin_audit_log'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to admin_audit_log" ON public.admin_audit_log FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to analytics_metrics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to analytics_metrics' AND tablename = 'analytics_metrics'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to analytics_metrics" ON public.analytics_metrics FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to bi_reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to bi_reports' AND tablename = 'bi_reports'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to bi_reports" ON public.bi_reports FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to error_tracking
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to error_tracking' AND tablename = 'error_tracking'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to error_tracking" ON public.error_tracking FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to module_metadata
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to module_metadata' AND tablename = 'module_metadata'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to module_metadata" ON public.module_metadata FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to performance_metrics  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to performance_metrics' AND tablename = 'performance_metrics'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to performance_metrics" ON public.performance_metrics FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to lead_settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to lead_settings' AND tablename = 'lead_settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to lead_settings" ON public.lead_settings FOR ALL TO anon USING (false)';
  END IF;

  -- Deny anonymous access to plugin_settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Deny anonymous access to plugin_settings' AND tablename = 'plugin_settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Deny anonymous access to plugin_settings" ON public.plugin_settings FOR ALL TO anon USING (false)';
  END IF;

END
$$;