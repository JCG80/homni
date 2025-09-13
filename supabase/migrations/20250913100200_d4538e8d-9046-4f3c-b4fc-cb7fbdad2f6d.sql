-- SECURITY FIX MIGRATION v2: Fix all critical RLS and function security issues
-- Handles existing policies properly with comprehensive DROP IF EXISTS

-- ================================================
-- PART 1: Fix Function Search Path Issues
-- ================================================

-- Fix functions to have proper search_path for security
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

CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_name text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flag_record RECORD;
  user_role TEXT;
  random_value FLOAT;
BEGIN
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  IF user_role IS NULL THEN
    SELECT raw_user_meta_data->>'role' INTO user_role FROM auth.users WHERE id = user_id;
  END IF;
  
  SELECT is_enabled, rollout_percentage, target_roles
  INTO flag_record
  FROM public.feature_flags
  WHERE name = flag_name;
  
  IF NOT FOUND OR NOT flag_record.is_enabled THEN
    RETURN FALSE;
  END IF;
  
  IF flag_record.target_roles IS NOT NULL AND 
     array_length(flag_record.target_roles, 1) > 0 AND
     NOT (user_role = ANY(flag_record.target_roles)) THEN
    RETURN FALSE;
  END IF;
  
  IF flag_record.rollout_percentage < 100 THEN
    random_value := abs(('x' || md5(user_id::text || flag_name))::bit(32)::int / 2147483647.0::float);
    RETURN (random_value * 100) < flag_record.rollout_percentage;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ================================================
-- PART 2: Drop Existing Anonymous Access Policies
-- ================================================

-- Drop all existing problematic policies systematically
DROP POLICY IF EXISTS "Block anonymous access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Auth users view user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;

DROP POLICY IF EXISTS "Auth users view relevant leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;

-- Drop anonymous blocking policies that need to be recreated
DROP POLICY IF EXISTS "Deny anonymous access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Deny anonymous access to properties" ON public.properties;
DROP POLICY IF EXISTS "Deny anonymous lead access except insert" ON public.leads;

-- ================================================
-- PART 3: Create Secure RLS Policies
-- ================================================

-- USER_PROFILES: Secure access for Phase 1A
CREATE POLICY "block_anon_user_profiles" 
ON public.user_profiles
FOR ALL
TO anon
USING (false);

CREATE POLICY "users_view_own_profile" 
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" 
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admins_view_all_profiles" 
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'master_admin'::app_role)
);

-- PROPERTIES: Secure access for Phase 1A
CREATE POLICY "block_anon_properties" 
ON public.properties
FOR ALL
TO anon
USING (false);

CREATE POLICY "users_manage_own_properties" 
ON public.properties
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- LEADS: Secure access with limited anonymous insert
CREATE POLICY "block_anon_leads_read" 
ON public.leads
FOR SELECT
TO anon
USING (false);

CREATE POLICY "users_view_own_leads" 
ON public.leads
FOR SELECT
TO authenticated
USING (
  submitted_by = auth.uid() OR
  (anonymous_email IS NOT NULL AND 
   EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND lower(email) = lower(leads.anonymous_email)))
);

-- ================================================
-- PART 4: Block Anonymous Access on System Tables
-- ================================================

-- Create anonymous blocking policies for all system tables
DO $$
DECLARE
    table_name text;
    tables_to_secure text[] := ARRAY[
        'admin_actions_log',
        'admin_audit_log', 
        'admin_logs',
        'error_tracking',
        'performance_metrics',
        'analytics_events',
        'analytics_metrics',
        'company_profiles',
        'lead_assignments',
        'lead_history',
        'company_budget_transactions',
        'module_access',
        'user_modules',
        'system_modules',
        'plugin_manifests',
        'plugin_settings',
        'property_documents',
        'property_maintenance_tasks',
        'todos'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure
    LOOP
        EXECUTE format(
            'CREATE POLICY "block_anon_%s" ON public.%I FOR ALL TO anon USING (false)',
            table_name, table_name
        );
    END LOOP;
END $$;

-- ================================================
-- PART 5: Allow Controlled Public Access
-- ================================================

-- Feature flags: only public flags for anonymous
DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Anonymous can read public feature flags" ON public.feature_flags;

CREATE POLICY "anon_read_public_flags" 
ON public.feature_flags
FOR SELECT
TO anon
USING (is_public = true);

-- Maintenance tasks: allow public read
DROP POLICY IF EXISTS "mt_read_all" ON public.maintenance_tasks;

CREATE POLICY "public_read_maintenance_tasks" 
ON public.maintenance_tasks
FOR SELECT
USING (true);

-- Content: allow published content for anonymous
CREATE POLICY "anon_read_published_content" 
ON public.content
FOR SELECT
TO anon
USING (published = true);

-- Insurance data: allow public read
CREATE POLICY "anon_read_insurance_companies" 
ON public.insurance_companies
FOR SELECT
TO anon
USING (status = 'published' OR status = 'active');

CREATE POLICY "anon_read_insurance_types" 
ON public.insurance_types
FOR SELECT
TO anon
USING (true);

-- ================================================
-- PART 6: Storage Security
-- ================================================

-- Block anonymous access to storage
CREATE POLICY "block_anon_storage" 
ON storage.objects
FOR ALL
TO anon
USING (false);

-- ================================================
-- SUMMARY
-- This migration creates secure RLS policies that:
-- 1. Block all anonymous access except where explicitly needed
-- 2. Fix function search_path issues
-- 3. Secure Phase 1A User functionality (profiles, properties, leads)
-- 4. Maintain necessary public access for legitimate features
-- ================================================