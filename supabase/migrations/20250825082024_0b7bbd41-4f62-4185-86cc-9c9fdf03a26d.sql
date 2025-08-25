-- FASE 1B Del 1: Database Schema Update - Retry with proper type casting
-- Create enum and migrate leads.status safely

-- 1) Create enum type if it doesn't exist
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

-- 2) Add temporary column with enum type
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status_enum public.lead_status;

-- 3) Populate the enum column with proper mapping
UPDATE public.leads 
SET status_enum = (
  CASE 
    WHEN status IS NULL THEN 'new'::public.lead_status
    -- Already canonical slugs
    WHEN lower(trim(status)) = 'new' THEN 'new'::public.lead_status
    WHEN lower(trim(status)) = 'qualified' THEN 'qualified'::public.lead_status
    WHEN lower(trim(status)) = 'contacted' THEN 'contacted'::public.lead_status
    WHEN lower(trim(status)) = 'negotiating' THEN 'negotiating'::public.lead_status
    WHEN lower(trim(status)) = 'converted' THEN 'converted'::public.lead_status
    WHEN lower(trim(status)) = 'lost' THEN 'lost'::public.lead_status
    WHEN lower(trim(status)) = 'paused' THEN 'paused'::public.lead_status
    -- Legacy synonyms
    WHEN lower(trim(status)) IN ('active','open') THEN 'new'::public.lead_status
    WHEN lower(trim(status)) IN ('in_progress','working') THEN 'contacted'::public.lead_status
    WHEN lower(trim(status)) IN ('closed_won','won') THEN 'converted'::public.lead_status
    WHEN lower(trim(status)) = 'closed_lost' THEN 'lost'::public.lead_status
    WHEN lower(trim(status)) = 'on_hold' THEN 'paused'::public.lead_status
    -- Emoji legacy values (just in case)
    WHEN status = '🆕' THEN 'new'::public.lead_status
    WHEN status = '✅' THEN 'qualified'::public.lead_status
    WHEN status = '📞' THEN 'contacted'::public.lead_status
    WHEN status = '🤝' THEN 'negotiating'::public.lead_status
    WHEN status = '🎉' THEN 'converted'::public.lead_status
    WHEN status = '❌' THEN 'lost'::public.lead_status
    WHEN status IN ('⏸️','⏸') THEN 'paused'::public.lead_status
    -- Fallback
    ELSE 'new'::public.lead_status
  END
);

-- 4) Drop old RLS policy that references text values
DROP POLICY IF EXISTS "Anon can insert minimal lead" ON public.leads;

-- 5) Drop the old text column and rename enum column
ALTER TABLE public.leads DROP COLUMN status;
ALTER TABLE public.leads RENAME COLUMN status_enum TO status;

-- 6) Set default and not null constraint
ALTER TABLE public.leads 
ALTER COLUMN status SET DEFAULT 'new'::public.lead_status,
ALTER COLUMN status SET NOT NULL;

-- 7) Recreate RLS policy for enum values
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

-- 8) Performance indexes
CREATE INDEX IF NOT EXISTS idx_leads_status_company_created_at
  ON public.leads (status, company_id, created_at);

CREATE INDEX IF NOT EXISTS idx_leads_category_status
  ON public.leads (category, status);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role_company
  ON public.user_profiles (role, company_id);