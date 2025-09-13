-- Fix remaining Anonymous Access Policies - Major security cleanup
-- Phase 2: User-facing tables and core functionality tables

-- Fix user-related tables: Remove anonymous access from user data
DROP POLICY IF EXISTS "Authenticated users view company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users view insurance types" ON public.insurance_types; 
DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;

-- Replace with proper authenticated-only access
CREATE POLICY "company_profiles_authenticated_only" ON public.company_profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    get_current_user_role_safe() IN ('admin', 'master_admin')
  )
);

CREATE POLICY "insurance_types_authenticated_only" ON public.insurance_types  
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Feature flags should only be readable by authenticated users
CREATE POLICY "feature_flags_authenticated_read_only" ON public.feature_flags
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix content table: Remove anonymous access to content
DROP POLICY IF EXISTS "Published content viewable by authenticated users" ON public.content;
CREATE POLICY "content_authenticated_users_only" ON public.content
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    status = 'published' OR 
    get_current_user_role_safe() IN ('admin', 'master_admin', 'content_editor')
  )
);

-- Fix maintenance_tasks: Remove anonymous access
DROP POLICY IF EXISTS "allow_anon_read_maintenance_tasks" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "mt_read_all" ON public.maintenance_tasks;
CREATE POLICY "maintenance_tasks_authenticated_read" ON public.maintenance_tasks
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix insurance companies: Remove anonymous access  
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
CREATE POLICY "insurance_companies_authenticated_read" ON public.insurance_companies
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix lead packages: Remove anonymous access
DROP POLICY IF EXISTS "Lead packages public read" ON public.lead_packages;  
CREATE POLICY "lead_packages_authenticated_read" ON public.lead_packages
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix lead pricing: Remove anonymous access
DROP POLICY IF EXISTS "Everyone can view active pricing tiers" ON public.lead_pricing_tiers;
CREATE POLICY "lead_pricing_authenticated_read" ON public.lead_pricing_tiers
FOR SELECT USING (
  auth.uid() IS NOT NULL AND is_active = true
);