-- Secure project_docs: remove public SELECT and restrict to authenticated users only
-- UP MIGRATION
DO $$ BEGIN
  -- Ensure RLS is enabled (idempotent)
  BEGIN
    ALTER TABLE public.project_docs ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN others THEN
    -- ignore if already enabled or table missing in this context
    NULL;
  END;

  -- Drop legacy public policy if it exists
  BEGIN
    DROP POLICY IF EXISTS "Project docs are publicly viewable" ON public.project_docs;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
END $$;

-- Authenticated users can read project docs
CREATE POLICY "Project docs selectable by authenticated users"
  ON public.project_docs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Existing admin policies (insert/update/delete) remain unchanged

-- DOWN MIGRATION (for rollback reference)
-- To rollback, run:
-- DO $$ BEGIN
--   BEGIN DROP POLICY IF EXISTS "Project docs selectable by authenticated users" ON public.project_docs; EXCEPTION WHEN undefined_object THEN NULL; END;
-- END $$;
-- CREATE POLICY "Project docs are publicly viewable" ON public.project_docs FOR SELECT USING (true);