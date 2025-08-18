-- Fix RLS policies with correct column references
-- First, let's check the actual structure and fix accordingly

-- 1. Fix leads table RLS - use correct columns
DROP POLICY IF EXISTS "lead_insert_public" ON public.leads;
DROP POLICY IF EXISTS "lead_anon_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_anon_insert_only" ON public.leads;
DROP POLICY IF EXISTS "leads_authenticated_select" ON public.leads;

-- Allow anonymous users to insert leads only
CREATE POLICY "leads_anon_insert_only" ON public.leads
FOR INSERT 
TO anon
WITH CHECK (true);

-- Authenticated users can see their own leads + admins see all
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

-- 2. Fix feature_flags - restrict to authenticated only
DROP POLICY IF EXISTS "Feature flags are viewable by authenticated users" ON public.feature_flags;
DROP POLICY IF EXISTS "Feature flags viewable by authenticated" ON public.feature_flags;
DROP POLICY IF EXISTS "feature_flags_authenticated_select" ON public.feature_flags;

CREATE POLICY "feature_flags_authenticated_select" ON public.feature_flags
FOR SELECT 
TO authenticated
USING (true);

-- 3. Fix module_metadata - restrict to authenticated only  
DROP POLICY IF EXISTS "Module metadata is viewable by authenticated users" ON public.module_metadata;
DROP POLICY IF EXISTS "Module metadata viewable by authenticated" ON public.module_metadata;
DROP POLICY IF EXISTS "module_metadata_authenticated_select" ON public.module_metadata;

CREATE POLICY "module_metadata_authenticated_select" ON public.module_metadata
FOR SELECT 
TO authenticated
USING (true);

-- 4. Create security definer function to check user roles (if not exists)
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

-- 5. Fix company_profiles policies (avoid user_id column issue)
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated can view company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "company_profiles_authenticated_only" ON public.company_profiles;

-- Create new policy that works with company_profiles structure
CREATE POLICY "company_profiles_restricted_access" ON public.company_profiles
FOR SELECT 
TO authenticated
USING (
  public.get_current_user_role() IN ('admin', 'master_admin', 'company') OR
  id IN (
    SELECT company_id FROM public.user_profiles 
    WHERE user_id = auth.uid() AND company_id IS NOT NULL
  )
);

-- 6. Fix content table policies
DROP POLICY IF EXISTS "Published content is public" ON public.content;
DROP POLICY IF EXISTS "content_public_read_published" ON public.content;
DROP POLICY IF EXISTS "content_authenticated_read_all" ON public.content;

-- Allow public access to published content only
CREATE POLICY "content_public_published_only" ON public.content
FOR SELECT 
USING (status = 'published');

-- 7. Ensure all functions have proper search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.get_current_user_role() SET search_path = public;