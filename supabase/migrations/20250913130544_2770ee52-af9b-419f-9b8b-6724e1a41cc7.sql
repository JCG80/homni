-- ============================================================================
-- PHASE 5: FIX REMAINING FUNCTION SEARCH PATH AND RLS POLICIES
-- ============================================================================

-- Fix the remaining function with mutable search path
CREATE OR REPLACE FUNCTION public.maint_due_tasks(p_user uuid, p_season text)
RETURNS TABLE(task_id uuid, title text, description text, priority text, frequency_months integer, last_completed timestamp with time zone, is_due boolean)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH latest AS (
    SELECT task_id, max(completed_at) AS last_completed 
    FROM user_task_log 
    WHERE user_id = p_user 
    GROUP BY task_id
  )
  SELECT 
    t.id, 
    t.title, 
    t.description, 
    t.priority, 
    t.frequency_months,
    l.last_completed,
    COALESCE((now() - COALESCE(l.last_completed, to_timestamp(0))) > make_interval(months => t.frequency_months), true) AS is_due
  FROM maintenance_tasks t
  LEFT JOIN latest l ON l.task_id = t.id
  WHERE p_season = ANY (t.seasons)
$$;

-- ============================================================================
-- PHASE 6: SECURE PUBLIC CONTENT TABLES - REMOVE ANONYMOUS ACCESS
-- ============================================================================

-- These tables currently allow anonymous reading but should be authentication-only

-- 1. Fix content table - Remove anonymous access
DROP POLICY IF EXISTS "allow_anon_read_published_content" ON public.content;
CREATE POLICY "content_authenticated_read_published" ON public.content
FOR SELECT USING (
  auth.uid() IS NOT NULL AND published = true
);

-- 2. Fix maintenance tasks - Remove anonymous access
DROP POLICY IF EXISTS "allow_anon_read_maintenance_tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "mt_read_all" ON public.maintenance_tasks;
CREATE POLICY "maintenance_tasks_authenticated_read" ON public.maintenance_tasks
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Fix insurance types - Remove anonymous access  
DROP POLICY IF EXISTS "allow_anon_read_insurance_types" ON public.insurance_types;
CREATE POLICY "insurance_types_authenticated_read" ON public.insurance_types
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Fix detached buildings - Remove anonymous access
DROP POLICY IF EXISTS "Public can view detached buildings" ON public.detached_buildings;
CREATE POLICY "detached_buildings_authenticated_read" ON public.detached_buildings
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 5. Fix insurance companies - Remove anonymous access
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
CREATE POLICY "insurance_companies_authenticated_read" ON public.insurance_companies
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Fix company reviews - Remove anonymous access
DROP POLICY IF EXISTS "Anyone can view company reviews" ON public.company_reviews;
CREATE POLICY "company_reviews_authenticated_read" ON public.company_reviews
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 7. Fix lead packages - Remove anonymous access
DROP POLICY IF EXISTS "Lead packages public read" ON public.lead_packages;
CREATE POLICY "lead_packages_authenticated_read" ON public.lead_packages
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 8. Fix feature flags - Remove anonymous access but allow authenticated users to read
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "feature_flags_authenticated_read" ON public.feature_flags
FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PHASE 7: SECURE LEADS TABLE - PREVENT ANONYMOUS LEAD CREATION
-- ============================================================================

-- Fix leads table to prevent anonymous access while allowing authenticated lead creation
DROP POLICY IF EXISTS "Anon can insert minimal lead" ON public.leads;

-- Allow authenticated users to create leads
CREATE POLICY "leads_authenticated_create" ON public.leads
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    auth.uid() = submitted_by OR 
    submitted_by IS NULL -- Allow system to create leads
  )
);

-- Allow system to insert anonymous leads (for smart start)
CREATE POLICY "leads_system_anonymous_insert" ON public.leads
FOR INSERT WITH CHECK (
  submitted_by IS NULL AND 
  anonymous_email IS NOT NULL AND 
  session_id IS NOT NULL
);

-- ============================================================================
-- PHASE 8: SECURE SMART START SUBMISSIONS
-- ============================================================================

-- Fix smart start submissions to require proper authentication or session
DROP POLICY IF EXISTS "Anonymous can insert submissions" ON public.smart_start_submissions;
DROP POLICY IF EXISTS "System can insert submissions" ON public.smart_start_submissions;

-- Allow system to create submissions with proper session tracking
CREATE POLICY "smart_start_authenticated_or_session" ON public.smart_start_submissions
FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND session_id IS NOT NULL AND step_completed >= 1)
);

-- ============================================================================
-- PHASE 9: ADD MISSING RLS POLICIES FOR REMAINING TABLES
-- ============================================================================

-- Add policies for any remaining tables without proper RLS

-- System Health Metrics (if exists)
CREATE POLICY "system_health_admin_only" ON public.system_health_metrics
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Webhook Logs
CREATE POLICY "webhook_logs_admin_only" ON public.webhook_logs
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- User Task Log - Allow users to manage their own logs
CREATE POLICY "user_task_log_own_manage" ON public.user_task_log
FOR ALL USING (auth.uid() = user_id);

-- Buyer Spend Ledger - Admin only access
CREATE POLICY "buyer_spend_ledger_admin_only" ON public.buyer_spend_ledger
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Lead Assignment History - Admin and company access
CREATE POLICY "lead_assignment_history_admin_view" ON public.lead_assignment_history
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "lead_assignment_history_company_view" ON public.lead_assignment_history
FOR SELECT USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.company_id = buyer_id
  )
);