-- Fix critical security issues: Tighten RLS policies for admin tables
-- Remove anonymous access from sensitive admin tables

-- 1. Fix admin_actions_log - should only allow authenticated admins
DROP POLICY IF EXISTS "admin_actions_log_admin_select" ON public.admin_actions_log;
DROP POLICY IF EXISTS "admin_actions_log_admin_update" ON public.admin_actions_log;

CREATE POLICY "Authenticated admins can select admin actions"
ON public.admin_actions_log 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
);

CREATE POLICY "Authenticated admins can update admin actions"
ON public.admin_actions_log 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
);

-- 2. Fix admin_audit_log - should only allow authenticated master admins
DROP POLICY IF EXISTS "admin_audit_log_master_admin_select" ON public.admin_audit_log;

CREATE POLICY "Authenticated master admins can select audit log"
ON public.admin_audit_log 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'master_admin'::app_role)
);

-- 3. Fix analytics_events - should not allow anonymous access to admin functions
DROP POLICY IF EXISTS "analytics_events_admin_full_access_select" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_user_own_data_select" ON public.analytics_events;

CREATE POLICY "Authenticated admins can view all analytics events"
ON public.analytics_events 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
);

CREATE POLICY "Authenticated users can view their own analytics events"
ON public.analytics_events 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- 4. Fix analytics_metrics - should require authentication for admin access
DROP POLICY IF EXISTS "analytics_metrics_admin_select" ON public.analytics_metrics;

CREATE POLICY "Authenticated admins can select analytics metrics"
ON public.analytics_metrics 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
);

-- 5. Fix bi_reports - should require authentication
DROP POLICY IF EXISTS "bi_reports_admin_only" ON public.bi_reports;

CREATE POLICY "Authenticated admins manage BI reports"
ON public.bi_reports 
FOR ALL 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
);

-- 6. Add explicit deny policies for anonymous users on admin tables
CREATE POLICY "Deny anonymous access to admin_actions_log"
ON public.admin_actions_log 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to admin_audit_log"
ON public.admin_audit_log 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to analytics_metrics"
ON public.analytics_metrics 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to bi_reports"
ON public.bi_reports 
FOR ALL 
TO anon
USING (false);