-- Fix critical RLS security issues (corrected syntax)
-- Address anonymous access policies that may expose sensitive data

-- 1. Fix admin_actions_log - should NOT allow anonymous access
DROP POLICY IF EXISTS "admin_actions_log_authenticated_admin_only" ON public.admin_actions_log;

-- Separate policies for different operations
CREATE POLICY "admin_actions_log_admin_select" ON public.admin_actions_log
    FOR SELECT TO authenticated
    USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

CREATE POLICY "admin_actions_log_admin_insert" ON public.admin_actions_log
    FOR INSERT TO authenticated
    WITH CHECK ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

CREATE POLICY "admin_actions_log_admin_update" ON public.admin_actions_log
    FOR UPDATE TO authenticated
    USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)))
    WITH CHECK ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

-- 2. Fix admin_audit_log - should be master_admin only
DROP POLICY IF EXISTS "admin_audit_log_authenticated_master_admin_only" ON public.admin_audit_log;

CREATE POLICY "admin_audit_log_master_admin_select" ON public.admin_audit_log
    FOR SELECT TO authenticated
    USING ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "admin_audit_log_master_admin_insert" ON public.admin_audit_log
    FOR INSERT TO authenticated
    WITH CHECK ((auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'master_admin'::app_role));

-- 3. Fix analytics_events - ensure proper user isolation
DROP POLICY IF EXISTS "analytics_events_admin_manage" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_users_own" ON public.analytics_events;

CREATE POLICY "analytics_events_admin_full_access_select" ON public.analytics_events
    FOR SELECT TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "analytics_events_user_own_data_select" ON public.analytics_events
    FOR SELECT TO authenticated
    USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "analytics_events_system_insert" ON public.analytics_events
    FOR INSERT TO authenticated
    WITH CHECK ((auth.uid() IS NOT NULL) AND ((user_id = auth.uid()) OR (user_id IS NULL)));

-- 4. Fix analytics_metrics - admin only
DROP POLICY IF EXISTS "analytics_metrics_admin_only" ON public.analytics_metrics;
CREATE POLICY "analytics_metrics_admin_select" ON public.analytics_metrics
    FOR SELECT TO authenticated
    USING ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

CREATE POLICY "analytics_metrics_admin_insert" ON public.analytics_metrics
    FOR INSERT TO authenticated
    WITH CHECK ((auth.uid() IS NOT NULL) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

-- 5. Fix smart_start_submissions - improve anonymous access control
DROP POLICY IF EXISTS "smart_start_submissions_secure" ON public.smart_start_submissions;
CREATE POLICY "smart_start_submissions_authenticated_select" ON public.smart_start_submissions
    FOR SELECT TO authenticated
    USING ((auth.uid() IS NOT NULL) AND (
        has_role(auth.uid(), 'admin'::app_role) OR 
        has_role(auth.uid(), 'master_admin'::app_role) OR 
        (user_id = auth.uid()) OR
        (has_role(auth.uid(), 'company'::app_role) AND lead_created = true)
    ));

-- 6. Fix leads access - ensure proper company isolation  
DROP POLICY IF EXISTS "Auth users view relevant leads" ON public.leads;
CREATE POLICY "leads_authenticated_select" ON public.leads
    FOR SELECT TO authenticated
    USING ((auth.uid() IS NOT NULL) AND (
        (submitted_by = auth.uid()) OR
        has_role(auth.uid(), 'admin'::app_role) OR
        has_role(auth.uid(), 'master_admin'::app_role) OR
        (has_role(auth.uid(), 'company'::app_role) AND company_id = get_current_user_company_id())
    ));

-- Add documentation
COMMENT ON POLICY "admin_actions_log_admin_select" ON public.admin_actions_log 
    IS 'Restricts admin action logs viewing to authenticated admin users only';

COMMENT ON POLICY "analytics_events_user_own_data_select" ON public.analytics_events 
    IS 'Users can only view their own analytics events';

COMMENT ON POLICY "leads_authenticated_select" ON public.leads 
    IS 'Proper lead access control for users, companies and admins';