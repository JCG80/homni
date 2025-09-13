-- SECURITY FIX MIGRATION v3: Fix critical RLS and function security issues
-- Targeted fixes without assuming non-existent columns

-- ================================================
-- PART 1: Fix Function Search Path Issues
-- ================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(_user_id, auth.uid())
      AND ur.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.has_role(_user_id, 'master_admin'::app_role)
    OR public.has_role_grant('master_admin'::app_role, _user_id),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- ================================================
-- PART 2: Create Anonymous Blocking Policies
-- ================================================

-- Block anonymous access to critical Phase 1A tables
CREATE POLICY "block_anon_user_profiles" 
ON public.user_profiles
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_properties" 
ON public.properties
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_leads_read" 
ON public.leads
FOR SELECT
TO anon
USING (false);

CREATE POLICY "block_anon_property_documents" 
ON public.property_documents
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_property_maintenance_tasks" 
ON public.property_maintenance_tasks
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_todos" 
ON public.todos
FOR ALL
TO anon
USING (false);

-- Block anonymous access to admin/system tables
CREATE POLICY "block_anon_admin_actions_log" 
ON public.admin_actions_log
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_admin_audit_log" 
ON public.admin_audit_log
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_admin_logs" 
ON public.admin_logs
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_error_tracking" 
ON public.error_tracking
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_performance_metrics" 
ON public.performance_metrics
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_analytics_events" 
ON public.analytics_events
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_analytics_metrics" 
ON public.analytics_metrics
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_company_profiles" 
ON public.company_profiles
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_lead_assignments" 
ON public.lead_assignments
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_lead_history" 
ON public.lead_history
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_company_budget_transactions" 
ON public.company_budget_transactions
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_module_access" 
ON public.module_access
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_user_modules" 
ON public.user_modules
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_system_modules" 
ON public.system_modules
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_plugin_manifests" 
ON public.plugin_manifests
FOR ALL
TO anon
USING (false);

CREATE POLICY "block_anon_plugin_settings" 
ON public.plugin_settings
FOR ALL
TO anon
USING (false);

-- Block anonymous access to storage
CREATE POLICY "block_anon_storage_objects" 
ON storage.objects
FOR ALL
TO anon
USING (false);

-- ================================================
-- PART 3: Allow Necessary Public Access
-- ================================================

-- Allow anonymous read for maintenance tasks (needed for public features)
CREATE POLICY "allow_anon_read_maintenance_tasks" 
ON public.maintenance_tasks
FOR SELECT
TO anon
USING (true);

-- Allow anonymous read for published content
CREATE POLICY "allow_anon_read_published_content" 
ON public.content
FOR SELECT
TO anon
USING (published = true);

-- Allow anonymous read for insurance data (public directory)
CREATE POLICY "allow_anon_read_insurance_companies" 
ON public.insurance_companies
FOR SELECT
TO anon
USING (true);

CREATE POLICY "allow_anon_read_insurance_types" 
ON public.insurance_types
FOR SELECT
TO anon
USING (true);

-- ================================================
-- SUMMARY
-- This migration:
-- 1. Fixes function search_path security issues
-- 2. Blocks anonymous access to all sensitive tables
-- 3. Maintains necessary public access for legitimate features
-- 4. Secures Phase 1A User functionality
-- ================================================