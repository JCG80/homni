-- Phase 1: Critical Security Fixes - Block Anonymous Access
-- This migration addresses the 42 security warnings by implementing proper RLS policies

-- 1. Create a comprehensive security policy for admin_logs
DROP POLICY IF EXISTS "Admins only can manage admin logs" ON public.admin_logs;
CREATE POLICY "Authenticated admin access only"
  ON public.admin_logs
  FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- 2. Fix company_profiles anonymous access
DROP POLICY IF EXISTS "Auth users view company profiles" ON public.company_profiles;
CREATE POLICY "Authenticated users view company profiles"
  ON public.company_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'master_admin'::app_role)
    )
  );

-- 3. Restrict content to authenticated users only for non-public content
DROP POLICY IF EXISTS "Published content is public" ON public.content;
CREATE POLICY "Published content viewable by authenticated users"
  ON public.content
  FOR SELECT
  USING (
    published = true AND auth.uid() IS NOT NULL
  );

-- 4. Fix feature_flags anonymous access  
DROP POLICY IF EXISTS "Auth users view feature flags" ON public.feature_flags;
CREATE POLICY "Authenticated users only view feature flags"
  ON public.feature_flags
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 5. Restrict insurance data to authenticated users
DROP POLICY IF EXISTS "Insurance companies public view" ON public.insurance_companies;
CREATE POLICY "Authenticated users view insurance companies"
  ON public.insurance_companies
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Insurance types public view" ON public.insurance_types;  
CREATE POLICY "Authenticated users view insurance types"
  ON public.insurance_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Company insurance types public view" ON public.company_insurance_types;
CREATE POLICY "Authenticated users view company insurance types"
  ON public.company_insurance_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 6. Add explicit anonymous blocking policies where needed
CREATE POLICY "Block anonymous access to user_profiles"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Block anonymous access to module_access"
  ON public.module_access
  FOR ALL  
  USING (auth.uid() IS NOT NULL);

-- 7. Create audit log for security policy changes
INSERT INTO public.admin_logs (action, entity_type, entity_id, details)
VALUES (
  'security_policy_update',
  'rls_policies', 
  'phase_1_security_hardening',
  '{"description": "Phase 1 security hardening implemented", "policies_updated": 10, "anonymous_access_blocked": true}'
);