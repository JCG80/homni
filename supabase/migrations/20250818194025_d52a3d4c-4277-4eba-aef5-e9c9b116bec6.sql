-- Fix RLS policies to properly restrict anonymous access
-- This addresses the security warnings from the linter

-- 1. Fix leads table - only allow anon INSERT, not SELECT
DROP POLICY IF EXISTS "lead_insert_public" ON public.leads;
DROP POLICY IF EXISTS "lead_anon_insert" ON public.leads;

CREATE POLICY "leads_anon_insert_only" ON public.leads
FOR INSERT 
TO anon
WITH CHECK (true);

-- Ensure no anon SELECT access
CREATE POLICY "leads_authenticated_select" ON public.leads
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin', 'company')
  )
);

-- 2. Fix feature_flags - restrict anon access
DROP POLICY IF EXISTS "Feature flags are viewable by authenticated users" ON public.feature_flags;
DROP POLICY IF EXISTS "Feature flags viewable by authenticated" ON public.feature_flags;

CREATE POLICY "feature_flags_authenticated_select" ON public.feature_flags
FOR SELECT 
TO authenticated
USING (true);

-- 3. Fix module_metadata - restrict anon access  
DROP POLICY IF EXISTS "Module metadata is viewable by authenticated users" ON public.module_metadata;
DROP POLICY IF EXISTS "Module metadata viewable by authenticated" ON public.module_metadata;

CREATE POLICY "module_metadata_authenticated_select" ON public.module_metadata
FOR SELECT 
TO authenticated
USING (true);

-- 4. Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::text 
    FROM public.user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 5. Fix company_profiles - restrict anon access
DROP POLICY IF EXISTS "Authenticated can view company profiles" ON public.company_profiles;

CREATE POLICY "company_profiles_authenticated_only" ON public.company_profiles
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.get_current_user_role() IN ('admin', 'master_admin')
);

-- 6. Fix user_profiles - ensure proper access control
DROP POLICY IF EXISTS "user_profiles_admin_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;

CREATE POLICY "user_profiles_select_restricted" ON public.user_profiles
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.get_current_user_role() IN ('admin', 'master_admin')
);

-- 7. Remove any remaining anon access policies that shouldn't exist
-- These should be reviewed and updated to authenticated only

-- Update content table to be more restrictive
DROP POLICY IF EXISTS "Published content is public" ON public.content;

CREATE POLICY "content_public_read_published" ON public.content
FOR SELECT 
USING (status = 'published');

-- For authenticated users, they can see all content
CREATE POLICY "content_authenticated_read_all" ON public.content
FOR SELECT 
TO authenticated
USING (true);

-- 8. Ensure proper function security
-- All functions that were flagged should have search_path set
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;