-- Fix Anonymous Access Policies - Remove dangerous anonymous access
-- These policies currently allow anonymous access where they shouldn't

-- Fix admin_actions_log: Only authenticated admins should access
DROP POLICY IF EXISTS "Only authenticated admins can view audit log" ON public.admin_actions_log;
CREATE POLICY "Only authenticated admins can view audit log" ON public.admin_actions_log
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() IN ('admin', 'master_admin')
);

-- Fix admin_audit_log: Only authenticated master_admin should access  
DROP POLICY IF EXISTS "Only authenticated master_admin can access audit log" ON public.admin_audit_log;
CREATE POLICY "Only authenticated master_admin can access audit log" ON public.admin_audit_log
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() = 'master_admin'
);

-- Fix admin_logs: Only authenticated admins should access
DROP POLICY IF EXISTS "Only authenticated admins can access logs" ON public.admin_logs;
CREATE POLICY "Only authenticated admins can access logs" ON public.admin_logs
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() IN ('admin', 'master_admin')
);

-- Fix analytics_events: Remove anonymous access
DROP POLICY IF EXISTS "analytics_events_authenticated_users_only" ON public.analytics_events;
CREATE POLICY "analytics_events_authenticated_users_only" ON public.analytics_events
FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Fix analytics_metrics: Remove anonymous access  
DROP POLICY IF EXISTS "analytics_metrics_admin_only" ON public.analytics_metrics;
CREATE POLICY "analytics_metrics_admin_only" ON public.analytics_metrics
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() IN ('admin', 'master_admin')
);

-- Fix API related tables - only admins should access these
DROP POLICY IF EXISTS "Admin full access to api_integrations" ON public.api_integrations;
CREATE POLICY "Admin full access to api_integrations" ON public.api_integrations
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() IN ('admin', 'master_admin')
);

DROP POLICY IF EXISTS "Admin access to api_request_logs" ON public.api_request_logs;
CREATE POLICY "Admin access to api_request_logs" ON public.api_request_logs
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() IN ('admin', 'master_admin')
);

DROP POLICY IF EXISTS "Admin access to api_usage_metrics" ON public.api_usage_metrics;
CREATE POLICY "Admin access to api_usage_metrics" ON public.api_usage_metrics
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  public.get_current_user_role_safe() IN ('admin', 'master_admin')
);