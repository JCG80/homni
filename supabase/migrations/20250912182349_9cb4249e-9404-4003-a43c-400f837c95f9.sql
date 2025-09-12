-- Fix critical security issues from linter
-- 1. Fix functions without proper search_path
-- 2. Review and fix anonymous access policies

-- Fix function search_path issues
ALTER FUNCTION public.clear_company_context() SET search_path = public;
ALTER FUNCTION public.get_active_mode() SET search_path = public;
ALTER FUNCTION public.get_current_company_context() SET search_path = public;
ALTER FUNCTION public.set_company_context(uuid) SET search_path = public;

-- Add missing RLS policies for tables that have RLS enabled but no policies
-- service_modules table - needs proper policies
DROP POLICY IF EXISTS "Block anonymous access to service_modules" ON public.service_modules;
CREATE POLICY "Block anonymous access to service_modules" 
ON public.service_modules 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Ensure only authenticated users can access admin tables
DROP POLICY IF EXISTS "Block anonymous access to admin_actions_log" ON public.admin_actions_log;
CREATE POLICY "Block anonymous access to admin_actions_log" 
ON public.admin_actions_log 
FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Block anonymous access to admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "Block anonymous access to admin_audit_log" 
ON public.admin_audit_log 
FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Block anonymous access to admin_logs" ON public.admin_logs;
CREATE POLICY "Block anonymous access to admin_logs" 
ON public.admin_logs 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Fix analytics tables to block anonymous access
DROP POLICY IF EXISTS "Block anonymous access to analytics_events" ON public.analytics_events;
CREATE POLICY "Block anonymous access to analytics_events" 
ON public.analytics_events 
FOR ALL 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Block anonymous access to analytics_metrics" ON public.analytics_metrics;
CREATE POLICY "Block anonymous access to analytics_metrics" 
ON public.analytics_metrics 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Fix BI reports anonymous access
DROP POLICY IF EXISTS "Block anonymous access to bi_reports" ON public.bi_reports;
CREATE POLICY "Block anonymous access to bi_reports" 
ON public.bi_reports 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add comprehensive security function for checking authenticated admin roles
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  );
$$;

-- Update admin policies to use the new security function
DROP POLICY IF EXISTS "Only authenticated admins can view audit log" ON public.admin_actions_log;
CREATE POLICY "Only authenticated admins can view audit log" 
ON public.admin_actions_log 
FOR SELECT 
USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Only authenticated master_admin can access audit log" ON public.admin_audit_log;
CREATE POLICY "Only authenticated master_admin can access audit log" 
ON public.admin_audit_log 
FOR ALL 
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'master_admin'::app_role));

DROP POLICY IF EXISTS "Only authenticated admins can access logs" ON public.admin_logs;
CREATE POLICY "Only authenticated admins can access logs" 
ON public.admin_logs 
FOR ALL 
USING (public.is_authenticated_admin());

-- Fix performance_metrics anonymous access
DROP POLICY IF EXISTS "Block anonymous access to performance_metrics" ON public.performance_metrics;
CREATE POLICY "Block anonymous access to performance_metrics" 
ON public.performance_metrics 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Ensure error_tracking blocks anonymous access
DROP POLICY IF EXISTS "Block anonymous access to error_tracking" ON public.error_tracking;
CREATE POLICY "Block anonymous access to error_tracking" 
ON public.error_tracking 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Comment: This migration fixes the most critical security issues identified by the linter
-- All admin tables now properly block anonymous access
-- Functions now have proper search_path settings
-- Authentication checks are consolidated into reusable security definer functions