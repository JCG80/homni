-- FASE 1B Del 1: Lead Status ENUM + Indexes
-- Safe, idempotent migration to introduce enum and performance indexes

-- 1) Create enum type lead_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'lead_status'
  ) THEN
    CREATE TYPE public.lead_status AS ENUM (
      'new',
      'qualified',
      'contacted',
      'negotiating',
      'converted',
      'lost',
      'paused'
    );
  END IF;
END$$;

-- 2) Drop RLS policy that references text literals so we can recreate it against enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leads' AND policyname = 'Anon can insert minimal lead'
  ) THEN
    EXECUTE 'DROP POLICY "Anon can insert minimal lead" ON public.leads';
  END IF;
END$$;

-- 3) Convert leads.status from text -> public.lead_status with robust mapping of legacy values
ALTER TABLE public.leads
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.leads
  ALTER COLUMN status TYPE public.lead_status
  USING (
    CASE 
      WHEN status IS NULL THEN 'new'::public.lead_status
      -- Already canonical slugs
      WHEN lower(trim(status)) IN ('new','qualified','contacted','negotiating','converted','lost','paused') 
        THEN lower(trim(status))::public.lead_status
      -- Legacy synonyms
      WHEN lower(trim(status)) IN ('active','open') THEN 'new'::public.lead_status
      WHEN lower(trim(status)) IN ('in_progress','working') THEN 'contacted'::public.lead_status
      WHEN lower(trim(status)) IN ('closed_won','won') THEN 'converted'::public.lead_status
      WHEN lower(trim(status)) = 'closed_lost' THEN 'lost'::public.lead_status
      WHEN lower(trim(status)) = 'on_hold' THEN 'paused'::public.lead_status
      -- Emoji legacy values (UI-only in old data)
      WHEN status IN ('🆕') THEN 'new'::public.lead_status
      WHEN status IN ('✅') THEN 'qualified'::public.lead_status
      WHEN status IN ('📞') THEN 'contacted'::public.lead_status
      WHEN status IN ('🤝') THEN 'negotiating'::public.lead_status
      WHEN status IN ('🎉') THEN 'converted'::public.lead_status
      WHEN status IN ('❌') THEN 'lost'::public.lead_status
      WHEN status IN ('⏸️','⏸') THEN 'paused'::public.lead_status
      -- Fallback
      ELSE 'new'::public.lead_status
    END
  );

ALTER TABLE public.leads
  ALTER COLUMN status SET DEFAULT 'new'::public.lead_status;

-- 4) Recreate RLS policy for anonymous inserts to use enum values
CREATE POLICY "Anon can insert minimal lead"
ON public.leads
FOR INSERT
WITH CHECK (
  submitted_by IS NULL
  AND company_id IS NULL
  AND (
    status IS NULL OR status = ANY (ARRAY[
      'new'::public.lead_status,
      'qualified'::public.lead_status,
      'contacted'::public.lead_status,
      'negotiating'::public.lead_status,
      'converted'::public.lead_status,
      'lost'::public.lead_status,
      'paused'::public.lead_status
    ])
  )
);

-- 5) Performance indexes
-- Leads: (status, company_id, created_at)
CREATE INDEX IF NOT EXISTS idx_leads_status_company_created_at
  ON public.leads (status, company_id, created_at);

-- Leads: (category, status)
CREATE INDEX IF NOT EXISTS idx_leads_category_status
  ON public.leads (category, status);

-- User profiles: (role, company_id)
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_company
  ON public.user_profiles (role, company_id);
