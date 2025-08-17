
-- Phase 4 — DB standardization to slugs + safe anon insert + function hardening
-- Compatible with current schema that already has pipeline_stage enum using emoji labels.

-- 1) pipeline_stage: rename existing emoji labels to slug labels (no new type, keep dependencies intact)
DO $$
BEGIN
  -- new
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'pipeline_stage' AND e.enumlabel = '📥 new'
  ) THEN
    ALTER TYPE pipeline_stage RENAME VALUE '📥 new' TO 'new';
  END IF;

  -- in_progress
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'pipeline_stage' AND e.enumlabel = '🚀 in_progress'
  ) THEN
    ALTER TYPE pipeline_stage RENAME VALUE '🚀 in_progress' TO 'in_progress';
  END IF;

  -- won
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'pipeline_stage' AND e.enumlabel = '🏆 won'
  ) THEN
    ALTER TYPE pipeline_stage RENAME VALUE '🏆 won' TO 'won';
  END IF;

  -- lost
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'pipeline_stage' AND e.enumlabel = '❌ lost'
  ) THEN
    ALTER TYPE pipeline_stage RENAME VALUE '❌ lost' TO 'lost';
  END IF;
END$$;

-- Ensure reasonable default for lead_assignments.pipeline_stage
ALTER TABLE public.lead_assignments
  ALTER COLUMN pipeline_stage SET DEFAULT 'new'::pipeline_stage;

-- 2) leads.status to TEXT slugs + normalization + CHECK
DO $$
BEGIN
  -- If status is not TEXT yet (e.g. it's the pipeline_stage enum), switch to TEXT first
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'status'
      AND udt_name = 'pipeline_stage'
  ) THEN
    ALTER TABLE public.leads ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE public.leads ALTER COLUMN status TYPE text USING status::text;
  END IF;
END$$;

-- Normalize any legacy/emoji statuses to slugs (safe to run multiple times)
UPDATE public.leads
SET status = CASE
  WHEN status IN ('📥 new','new') THEN 'new'
  WHEN status IN ('👀 qualified','qualified') THEN 'qualified'
  WHEN status IN ('💬 contacted','contacted') THEN 'contacted'
  WHEN status IN ('📞 negotiating','negotiating') THEN 'negotiating'
  WHEN status IN ('✅ converted','converted','🏆 won') THEN 'converted'
  WHEN status IN ('❌ lost','lost') THEN 'lost'
  WHEN status IN ('⏸️ paused','paused') THEN 'paused'
  ELSE COALESCE(status,'new')
END;

-- Set default and CHECK constraint (idempotent)
ALTER TABLE public.leads
  ALTER COLUMN status SET DEFAULT 'new';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='leads' AND constraint_name='leads_status_slug_chk'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_status_slug_chk
      CHECK (
        status IS NULL OR status IN ('new','qualified','contacted','negotiating','converted','lost','paused')
      );
  END IF;
END$$;

-- 3) Allow anonymous leads: make submitted_by nullable (if not already)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='submitted_by' AND is_nullable='NO'
  ) THEN
    ALTER TABLE public.leads
      ALTER COLUMN submitted_by DROP NOT NULL;
  END IF;
END$$;

-- 4) RLS: tighten anonymous INSERT policy
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop previous overly broad anon policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='leads' AND policyname='Anonymous can create leads'
  ) THEN
    DROP POLICY "Anonymous can create leads" ON public.leads;
  END IF;
END$$;

-- Create strict anon insert policy (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='leads' AND policyname='Anon can insert minimal lead'
  ) THEN
    CREATE POLICY "Anon can insert minimal lead"
    ON public.leads
    FOR INSERT
    TO anon
    WITH CHECK (
      submitted_by IS NULL
      AND company_id IS NULL
      AND (status IS NULL OR status IN ('new','qualified','contacted','negotiating','converted','lost','paused'))
    );
  END IF;
END$$;

-- 5) Function hardening + fix execute_auto_purchase to slugs
-- Ensure SECURITY DEFINER + search_path=public on selected functions if they exist
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT n.nspname AS schema, p.proname AS name, pg_catalog.pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('distribute_new_lead','execute_auto_purchase')
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I(%s) SECURITY DEFINER', fn.name, fn.args);
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', fn.name, fn.args);
  END LOOP;
END$$;

-- Recreate execute_auto_purchase to use slug 'new' for pipeline_stage
CREATE OR REPLACE FUNCTION public.execute_auto_purchase(
  p_lead_id uuid,
  p_buyer_id uuid,
  p_package_id uuid,
  p_cost numeric
) RETURNS TABLE(assignment_id uuid, buyer_id uuid, cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_assignment_id UUID;
  v_current_budget NUMERIC;
BEGIN
  -- Prevent duplicate assignment
  SELECT id INTO v_assignment_id
  FROM lead_assignments
  WHERE lead_id = p_lead_id AND buyer_id = p_buyer_id;

  IF v_assignment_id IS NOT NULL THEN
    RAISE EXCEPTION 'Assignment already exists for this lead and buyer';
  END IF;

  -- Budget check
  SELECT current_budget INTO v_current_budget
  FROM buyer_accounts
  WHERE id = p_buyer_id;

  IF v_current_budget IS NULL OR v_current_budget < p_cost THEN
    RAISE EXCEPTION 'Insufficient budget';
  END IF;

  -- Create assignment (slug pipeline stage)
  INSERT INTO lead_assignments (
    lead_id,
    buyer_id,
    cost,
    assigned_at,
    auto_purchased_at,
    pipeline_stage
  ) VALUES (
    p_lead_id,
    p_buyer_id,
    p_cost,
    now(),
    now(),
    'new'::pipeline_stage
  ) RETURNING id INTO v_assignment_id;

  -- Update buyer budget
  UPDATE buyer_accounts
  SET current_budget = current_budget - p_cost,
      updated_at = now()
  WHERE id = p_buyer_id;

  -- Spending ledger
  INSERT INTO buyer_spend_ledger (
    buyer_id,
    assignment_id,
    amount,
    balance_after,
    transaction_type,
    description
  ) VALUES (
    p_buyer_id,
    v_assignment_id,
    -p_cost,
    v_current_budget - p_cost,
    'lead_purchase',
    'Auto-purchase of lead ' || p_lead_id::text
  );

  RETURN QUERY SELECT v_assignment_id, p_buyer_id, p_cost;
END;
$function$;

-- 6) (Optional sanity) ensure default on lead_assignments is correct after function update
ALTER TABLE public.lead_assignments
  ALTER COLUMN pipeline_stage SET DEFAULT 'new'::pipeline_stage;

-- Verification helpers (run manually if desired)
-- SELECT count(*) AS assignments_emoji_left FROM public.lead_assignments WHERE pipeline_stage::text ~ '📥|🚀|🏆|❌';
-- SELECT count(*) AS leads_emoji_left FROM public.leads WHERE status ~ '📥|👀|💬|📞|✅|❌|⏸';
-- SELECT status, count(*) FROM public.leads GROUP BY 1 ORDER BY 2 DESC;
-- SELECT pipeline_stage::text, count(*) FROM public.lead_assignments GROUP BY 1 ORDER BY 2 DESC;
