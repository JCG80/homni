-- Add helper to read active mode from JWT app_metadata
CREATE OR REPLACE FUNCTION public.get_active_mode()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF((current_setting('request.jwt.claims', true)::json->'app_metadata'->>'active_mode')::text, '');
$$;

-- Role mode audit table
CREATE TABLE IF NOT EXISTS public.role_switch_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_mode text NOT NULL CHECK (new_mode IN ('personal','professional')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security: enable RLS and allow safe reads
ALTER TABLE public.role_switch_audit ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit entries
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'role_switch_audit' AND policyname = 'Users can view own mode switches'
  ) THEN
    CREATE POLICY "Users can view own mode switches"
      ON public.role_switch_audit
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Admins can view all audit entries
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'role_switch_audit' AND policyname = 'Admins can view all mode switches'
  ) THEN
    CREATE POLICY "Admins can view all mode switches"
      ON public.role_switch_audit
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'admin'::app_role) OR 
        public.has_role(auth.uid(), 'master_admin'::app_role)
      );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_role_switch_audit_user_id ON public.role_switch_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_switch_audit_created_at ON public.role_switch_audit(created_at DESC);

-- NOTE: Skipping example policy on a non-existent `documents` table.
-- If you want mode-aware access on an existing table, tell us which table (e.g., project_docs/property_documents),
-- and we will add the appropriate RLS policy using get_active_mode().