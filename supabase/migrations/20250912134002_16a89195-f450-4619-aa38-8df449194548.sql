-- PHASE 0C: Complete Security Hardening (Fix remaining policies)
-- Fix the constraint issue and complete anonymous access restrictions

-- 1. Check allowed target_kind values and update appropriately
-- Most remaining policies just need explicit auth.uid() IS NOT NULL checks

-- Fix remaining analytics/metrics tables
DROP POLICY IF EXISTS "Authenticated users can view metrics" ON public.analytics_metrics;
CREATE POLICY "Only authenticated admins can view metrics" ON public.analytics_metrics 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

-- Fix BI reports  
DROP POLICY IF EXISTS "Companies can view relevant BI reports" ON public.bi_reports;
CREATE POLICY "Only authenticated companies can view BI reports" ON public.bi_reports 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'company'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  ));

-- Fix buyer accounts (should be admin-only)
DROP POLICY IF EXISTS "Admin only buyer accounts" ON public.buyer_accounts;
CREATE POLICY "Only authenticated admins manage buyer accounts" ON public.buyer_accounts 
  FOR ALL TO authenticated 
  USING (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)))
  WITH CHECK (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)));

-- Fix document categories
DROP POLICY IF EXISTS "Document categories are viewable by authenticated users" ON public.document_categories;
CREATE POLICY "Only authenticated users view document categories" ON public.document_categories 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Fix insurance companies/types for public viewing (these should allow public)
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
CREATE POLICY "Public can read published insurance companies" ON public.insurance_companies 
  FOR SELECT 
  USING (published = true);

-- Fix plugin manifests
DROP POLICY IF EXISTS "Plugin manifests are viewable by all authenticated users" ON public.plugin_manifests;
CREATE POLICY "Only authenticated users view plugin manifests" ON public.plugin_manifests 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Fix project docs
DROP POLICY IF EXISTS "Project docs selectable by authenticated users" ON public.project_docs;
CREATE POLICY "Only authenticated users read project docs" ON public.project_docs 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Fix todos (these are user-specific)
DROP POLICY IF EXISTS "todos_select_own" ON public.todos;
CREATE POLICY "Authenticated users select own todos" ON public.todos 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix user activity summaries
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_summaries;
CREATE POLICY "Authenticated users view own activity" ON public.user_activity_summaries 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix user roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Authenticated users view own roles" ON public.user_roles 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Create summary log entry with correct target_kind
INSERT INTO public.admin_actions_log (
  actor_user_id, 
  target_kind, 
  target_id, 
  action, 
  metadata
) VALUES (
  NULL, 
  'system', 
  gen_random_uuid(), 
  'security_hardening_phase_0c', 
  jsonb_build_object(
    'phase', 'Phase_0C_Complete_Security_Fix',
    'policies_updated', 10,
    'description', 'Completed anonymous access policy restrictions',
    'remaining_manual_steps', 4,
    'timestamp', now()
  )
);