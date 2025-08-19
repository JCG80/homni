-- Canonical RLS policies for public.leads (safe, non-recursive)
-- Run in Supabase SQL editor if you need to re-seed policies for the leads table
-- Uses helper functions: has_role(), get_current_user_company_id()

-- 1) Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 2) Clean up legacy/duplicate policies to avoid conflicts
DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can view leads assigned to them" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can update their assigned leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Anon can insert minimal lead" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Companies can view assigned leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

-- 3) Canonical policies (aligned with app tests and helpers)

-- Anonymous users can insert a minimal lead (no ownership/company linkage)
CREATE POLICY "Anon can insert minimal lead"
  ON public.leads
  FOR INSERT
  WITH CHECK (
    submitted_by IS NULL
    AND company_id IS NULL
    AND (
      status IS NULL
      OR status = ANY (ARRAY['new','qualified','contacted','negotiating','converted','lost','paused'])
    )
  );

-- Authenticated users can create their own leads
CREATE POLICY "Users can create their own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- Users can view their own submitted leads
CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = submitted_by);

-- Companies can view leads assigned to their company
CREATE POLICY "Companies can view assigned leads"
  ON public.leads
  FOR SELECT
  USING (
    has_role(auth.uid(), 'company'::app_role)
    AND company_id IS NOT NULL
    AND company_id = get_current_user_company_id()
  );

-- Companies can update leads assigned to their company
CREATE POLICY "Companies can update their assigned leads"
  ON public.leads
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'company'::app_role)
    AND company_id = get_current_user_company_id()
  );

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- Admins can update any lead
CREATE POLICY "Admins can update any lead"
  ON public.leads
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- Note:
-- We intentionally do NOT allow DELETE for anon/users by default.
-- If cleanup of test data is needed, prefer RPC with SECURITY DEFINER and proper checks.
