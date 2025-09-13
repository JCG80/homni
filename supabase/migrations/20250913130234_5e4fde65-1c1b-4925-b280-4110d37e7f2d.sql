-- ============================================================================
-- CRITICAL SECURITY FIXES - RLS and Anonymous Access Issues  
-- ============================================================================

-- 1. FIX ANONYMOUS ACCESS TO ADMIN TABLES
-- These tables should never allow anonymous access

-- Admin Actions Log - Remove anonymous access
DROP POLICY IF EXISTS "admin_actions_log_authenticated_only" ON public.admin_actions_log;
CREATE POLICY "admin_actions_log_admin_only" ON public.admin_actions_log
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Admin Audit Log - Restrict to master_admin only  
DROP POLICY IF EXISTS "admin_audit_log_authenticated_only" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log_master_admin_only" ON public.admin_audit_log
FOR ALL USING (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'master_admin'::app_role)
);

-- Admin Logs - Admin only access
DROP POLICY IF EXISTS "admin_logs_authenticated_only" ON public.admin_logs;
CREATE POLICY "admin_logs_admin_only" ON public.admin_logs
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 2. FIX ANALYTICS TABLES - Remove anonymous access
DROP POLICY IF EXISTS "analytics_events_authenticated_only" ON public.analytics_events;
CREATE POLICY "analytics_events_authenticated_users_only" ON public.analytics_events
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_events_admin_manage" ON public.analytics_events
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "analytics_events_users_own" ON public.analytics_events
FOR SELECT USING (auth.uid() = user_id);

-- Analytics Metrics - Admin only management
DROP POLICY IF EXISTS "analytics_metrics_authenticated_only" ON public.analytics_metrics;
CREATE POLICY "analytics_metrics_admin_only" ON public.analytics_metrics
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 3. FIX BI REPORTS - Admin only access
DROP POLICY IF EXISTS "bi_reports_authenticated_admin_only" ON public.bi_reports;
CREATE POLICY "bi_reports_admin_only" ON public.bi_reports
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 4. FIX BUYER TABLES - Admin only access
DROP POLICY IF EXISTS "Admin only buyer accounts" ON public.buyer_accounts;
CREATE POLICY "buyer_accounts_admin_only" ON public.buyer_accounts
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Buyer Package Subscriptions
DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.buyer_package_subscriptions;
DROP POLICY IF EXISTS "Buyers view own subscriptions" ON public.buyer_package_subscriptions;
CREATE POLICY "buyer_subscriptions_admin_only" ON public.buyer_package_subscriptions
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 5. FIX BUDGET TRANSACTIONS - Company users can view their own
DROP POLICY IF EXISTS "budget_transactions_authenticated_only" ON public.company_budget_transactions;
CREATE POLICY "budget_transactions_company_own" ON public.company_budget_transactions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.company_id = company_budget_transactions.company_id
  )
);

CREATE POLICY "budget_transactions_admin_all" ON public.company_budget_transactions
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 6. FIX PERFORMANCE METRICS - Admin only
DROP POLICY IF EXISTS "performance_metrics_authenticated_admin_only" ON public.performance_metrics;
CREATE POLICY "performance_metrics_admin_only" ON public.performance_metrics
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 7. FIX ERROR TRACKING - Admin only
DROP POLICY IF EXISTS "error_tracking_authenticated_admin_only" ON public.error_tracking;
CREATE POLICY "error_tracking_admin_only" ON public.error_tracking
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "error_tracking_system_insert" ON public.error_tracking
FOR INSERT WITH CHECK (true); -- Allow system to insert errors

-- 8. FIX LEAD SETTINGS - Admin only
DROP POLICY IF EXISTS "lead_settings_admin_only" ON public.lead_settings;
CREATE POLICY "lead_settings_admin_only" ON public.lead_settings
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 9. REMOVE BLOCK ANONYMOUS POLICIES (they're too restrictive)
DROP POLICY IF EXISTS "Block anonymous access to lead_assignments" ON public.lead_assignments;
DROP POLICY IF EXISTS "Block anonymous access to plugin_manifests" ON public.plugin_manifests;
DROP POLICY IF EXISTS "Block anonymous access to plugin_settings" ON public.plugin_settings;
DROP POLICY IF EXISTS "Block anonymous access to role_switch_audit" ON public.role_switch_audit;
DROP POLICY IF EXISTS "Block anonymous access to performance_metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Block anonymous access to lead_settings" ON public.lead_settings;
DROP POLICY IF EXISTS "Block anonymous access to service_modules" ON public.service_modules;