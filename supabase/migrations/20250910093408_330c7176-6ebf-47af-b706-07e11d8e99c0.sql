-- Migration: RLS cleanup and function search_path hardening (Phase 2C-1)
-- 1) Harden function search_path for functions missing explicit setting
-- Use ALTER FUNCTION to set a fixed search_path for security stability

-- get_current_company_context()
ALTER FUNCTION public.get_current_company_context() SET search_path = public;

-- set_company_context(company_uuid uuid)
ALTER FUNCTION public.set_company_context(uuid) SET search_path = public;

-- clear_company_context()
ALTER FUNCTION public.clear_company_context() SET search_path = public;

-- update_analytics_updated_at()
ALTER FUNCTION public.update_analytics_updated_at() SET search_path = public;

-- update_user_company_roles_updated_at()
ALTER FUNCTION public.update_user_company_roles_updated_at() SET search_path = public;


-- 2) Consolidate RLS policies for module_metadata to canonical, minimal set
DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Admins can manage module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Auth users view module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Authenticated users view module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Authenticated users can view module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Block anonymous access to module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Module metadata is viewable by authenticated users" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Only admins can manage module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Only admins can modify module metadata" ON public.module_metadata; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

-- Canonical policies
CREATE POLICY "module_metadata_select_auth"
  ON public.module_metadata
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "module_metadata_admin_all"
  ON public.module_metadata
  FOR ALL
  USING (has_role_level(auth.uid(), 80))
  WITH CHECK (has_role_level(auth.uid(), 80));


-- 3) Leads: remove overly-permissive anonymous insert policy (legacy)
DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Anonymous can create leads only" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;
