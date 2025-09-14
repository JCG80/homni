-- PHASE 2: Comprehensive Security Fix - Address remaining anonymous access policies
-- Fix all remaining policies to explicitly deny anonymous access

-- Update all public-facing policies to require authenticated users
-- This systematically addresses the anonymous access warnings

-- Fix localization_entries (public read is intentional but needs to be controlled)
DROP POLICY IF EXISTS "Everyone can view localization entries" ON public.localization_entries;
CREATE POLICY "Authenticated users can view localization entries" 
ON public.localization_entries 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix lead_pricing_tiers 
DROP POLICY IF EXISTS "Everyone can view active pricing tiers" ON public.lead_pricing_tiers;
CREATE POLICY "Authenticated users can view active pricing tiers" 
ON public.lead_pricing_tiers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND is_active = true
);

-- Fix company_reviews (public read but needs authentication)
DROP POLICY IF EXISTS "Anyone can view company reviews" ON public.company_reviews;
CREATE POLICY "Authenticated users can view company reviews" 
ON public.company_reviews 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix feature_flags policies
DROP POLICY IF EXISTS "feature_flags_authenticated_read_only" ON public.feature_flags;
CREATE POLICY "feature_flags_authenticated_read_only" 
ON public.feature_flags 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix module_metadata policies
DROP POLICY IF EXISTS "module_metadata_select_auth" ON public.module_metadata;
CREATE POLICY "module_metadata_select_auth" 
ON public.module_metadata 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix project_docs policies  
DROP POLICY IF EXISTS "project_docs_auth_read" ON public.project_docs;
CREATE POLICY "project_docs_auth_read" 
ON public.project_docs 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix service_modules policies
DROP POLICY IF EXISTS "service_modules_auth_read" ON public.service_modules;
CREATE POLICY "service_modules_auth_read" 
ON public.service_modules 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix maintenance_tasks policies
DROP POLICY IF EXISTS "maintenance_tasks_authenticated_read" ON public.maintenance_tasks;
CREATE POLICY "maintenance_tasks_authenticated_read" 
ON public.maintenance_tasks 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix insurance_types policies
DROP POLICY IF EXISTS "insurance_types_authenticated_only" ON public.insurance_types;
CREATE POLICY "insurance_types_authenticated_only" 
ON public.insurance_types 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix insurance_companies policies
DROP POLICY IF EXISTS "insurance_companies_authenticated_read" ON public.insurance_companies;
CREATE POLICY "insurance_companies_authenticated_read" 
ON public.insurance_companies 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix document_categories policies
DROP POLICY IF EXISTS "document_categories_authenticated_only" ON public.document_categories;
CREATE POLICY "document_categories_authenticated_only" 
ON public.document_categories 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix detached_buildings policies
DROP POLICY IF EXISTS "detached_buildings_authenticated_read" ON public.detached_buildings;
CREATE POLICY "detached_buildings_authenticated_read" 
ON public.detached_buildings 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Fix user_task_log policies
DROP POLICY IF EXISTS "utl_read_self" ON public.user_task_log;
CREATE POLICY "utl_read_self" 
ON public.user_task_log 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

-- Fix role_switch_audit policies
DROP POLICY IF EXISTS "role_switch_audit_own_view" ON public.role_switch_audit;
DROP POLICY IF EXISTS "role_switch_audit_admin_view" ON public.role_switch_audit;

CREATE POLICY "role_switch_audit_own_view" 
ON public.role_switch_audit 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "role_switch_audit_admin_view" 
ON public.role_switch_audit 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix user_modules policies
DROP POLICY IF EXISTS "user_modules_own_view" ON public.user_modules;
DROP POLICY IF EXISTS "user_modules_admin_manage" ON public.user_modules;

CREATE POLICY "user_modules_own_view" 
ON public.user_modules 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "user_modules_admin_manage" 
ON public.user_modules 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix user_roles policies
DROP POLICY IF EXISTS "user_roles_own_view" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;

CREATE POLICY "user_roles_own_view" 
ON public.user_roles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "user_roles_admin_manage" 
ON public.user_roles 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix user_activity_summaries policies
DROP POLICY IF EXISTS "user_activity_own_view" ON public.user_activity_summaries;
DROP POLICY IF EXISTS "user_activity_admin_view" ON public.user_activity_summaries;

CREATE POLICY "user_activity_own_view" 
ON public.user_activity_summaries 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "user_activity_admin_view" 
ON public.user_activity_summaries 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Create explicit DENY policies for anonymous users on sensitive tables
-- This creates a strong barrier against anonymous access

CREATE POLICY "deny_anonymous_user_profiles" 
ON public.user_profiles 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "deny_anonymous_user_roles" 
ON public.user_roles 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "deny_anonymous_todos" 
ON public.todos 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "deny_anonymous_analytics_events" 
ON public.analytics_events 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "deny_anonymous_performance_metrics" 
ON public.performance_metrics 
FOR ALL 
TO anon 
USING (false);