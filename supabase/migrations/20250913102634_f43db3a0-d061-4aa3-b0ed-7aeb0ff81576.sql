-- TARGETED SECURITY FIX: Address critical security issues only
-- Focus on function search paths and existing table policies

-- ============================================================================
-- PART 1: FIX FUNCTION SEARCH PATHS (CRITICAL SECURITY ISSUE)
-- ============================================================================

-- Fix function search_path security for all functions
ALTER FUNCTION public.link_anonymous_leads_to_user(uuid, text) SET search_path = public;
ALTER FUNCTION public.clear_company_context() SET search_path = public;
ALTER FUNCTION public.check_admin_role(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.create_anonymous_lead_and_distribute(text, text, text, jsonb, text, text) SET search_path = public;
ALTER FUNCTION public.get_internal_admins() SET search_path = public;
ALTER FUNCTION public.aggregate_user_daily_activity(date) SET search_path = public;
ALTER FUNCTION public.get_user_role_level(uuid) SET search_path = public;
ALTER FUNCTION public.get_auth_user_role() SET search_path = public;
ALTER FUNCTION public.set_internal_admin_status(text, boolean) SET search_path = public;
ALTER FUNCTION public.has_role_level(uuid, integer) SET search_path = public;
ALTER FUNCTION public.enforce_internal_admin_change() SET search_path = public;
ALTER FUNCTION public.get_enabled_plugins() SET search_path = public;
ALTER FUNCTION public.assign_lead_with_budget(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.revoke_role(uuid, app_role, text) SET search_path = public;
ALTER FUNCTION public.get_user_effective_roles(uuid) SET search_path = public;
ALTER FUNCTION public.is_master_admin(uuid) SET search_path = public;
ALTER FUNCTION public.list_all_user_profiles() SET search_path = public;
ALTER FUNCTION public.get_user_modules_with_category(uuid) SET search_path = public;
ALTER FUNCTION public.is_plugin_enabled(text) SET search_path = public;
ALTER FUNCTION public.bulk_check_module_access(text[], uuid) SET search_path = public;
ALTER FUNCTION public.distribute_new_lead_v3(uuid) SET search_path = public;
ALTER FUNCTION public.sync_user_profile_role() SET search_path = public;
ALTER FUNCTION public.validate_user_role_consistency() SET search_path = public;
ALTER FUNCTION public.ensure_user_profile(uuid, text, uuid) SET search_path = public;
ALTER FUNCTION public.get_current_company_context() SET search_path = public;
ALTER FUNCTION public.set_company_context(uuid) SET search_path = public;
ALTER FUNCTION public.track_analytics_event(text, text, jsonb, uuid, text) SET search_path = public;
ALTER FUNCTION public.system_health_check() SET search_path = public;
ALTER FUNCTION public.create_smart_start_submission(text, text, text[], boolean, text, text, jsonb, integer, text, uuid) SET search_path = public;
ALTER FUNCTION public.has_module_access(text, uuid) SET search_path = public;
ALTER FUNCTION public.get_user_enabled_modules(uuid) SET search_path = public;
ALTER FUNCTION public.get_role_default_modules(text) SET search_path = public;
ALTER FUNCTION public.initialize_user_module_access(uuid) SET search_path = public;
ALTER FUNCTION public.bulk_update_user_module_access(uuid, uuid[], boolean, uuid, text) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_internal_admin(uuid) SET search_path = public;
ALTER FUNCTION public.check_admin_role() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.log_admin_action(text, uuid, text, jsonb) SET search_path = public;
ALTER FUNCTION public.distribute_new_lead_v2(uuid) SET search_path = public;
ALTER FUNCTION public.get_current_user_company_id() SET search_path = public;
ALTER FUNCTION public.distribute_new_lead(uuid) SET search_path = public;
ALTER FUNCTION public.has_role_grant(app_role, uuid, text) SET search_path = public;
ALTER FUNCTION public.grant_role(uuid, app_role, text, timestamptz) SET search_path = public;
ALTER FUNCTION public.is_authenticated_admin() SET search_path = public;
ALTER FUNCTION public.update_user_profile(uuid, text, text, text) SET search_path = public;
ALTER FUNCTION public.delete_user_profile(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_profile(uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.is_feature_enabled(text, uuid) SET search_path = public;

-- ============================================================================
-- PART 2: CLEAN UP CONFLICTING REDUNDANT POLICIES
-- ============================================================================

-- Remove redundant "block_anon" policies that conflict with functional policies
DO $$ 
BEGIN
  -- These "block_anon" policies are redundant because the tables already have
  -- proper auth-based policies that handle access control correctly
  DROP POLICY IF EXISTS "block_anon_admin_actions_log" ON public.admin_actions_log;
  DROP POLICY IF EXISTS "block_anon_admin_audit_log" ON public.admin_audit_log;  
  DROP POLICY IF EXISTS "block_anon_admin_logs" ON public.admin_logs;
  DROP POLICY IF EXISTS "block_anon_analytics_metrics" ON public.analytics_metrics;
  DROP POLICY IF EXISTS "block_anon_performance_metrics" ON public.performance_metrics;
  DROP POLICY IF EXISTS "block_anon_bi_reports" ON public.bi_reports;
  DROP POLICY IF EXISTS "block_anon_company_profiles" ON public.company_profiles;
  DROP POLICY IF EXISTS "block_anon_company_budget_transactions" ON public.company_budget_transactions;
  DROP POLICY IF EXISTS "block_anon_error_tracking" ON public.error_tracking;
  DROP POLICY IF EXISTS "block_anon_lead_assignments" ON public.lead_assignments;
  DROP POLICY IF EXISTS "block_anon_leads_read" ON public.leads;
  DROP POLICY IF EXISTS "block_anon_plugin_manifests" ON public.plugin_manifests;
  DROP POLICY IF EXISTS "block_anon_plugin_settings" ON public.plugin_settings;
  DROP POLICY IF EXISTS "block_anon_property_documents" ON public.property_documents;
  DROP POLICY IF EXISTS "block_anon_property_maintenance_tasks" ON public.property_maintenance_tasks;
  DROP POLICY IF EXISTS "block_anon_todos" ON public.todos;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;