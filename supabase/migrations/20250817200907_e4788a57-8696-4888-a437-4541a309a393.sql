-- Fix pipeline_stage enum to use slugs instead of emojis

-- Create pipeline_stage enum with slug values if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_stage') THEN
    CREATE TYPE pipeline_stage AS ENUM ('new','in_progress','won','lost');
  END IF;
END$$;

-- Update lead_assignments table to use slug values
UPDATE lead_assignments 
SET pipeline_stage = CASE
  WHEN pipeline_stage IN ('📥 new', 'new') THEN 'new'
  WHEN pipeline_stage IN ('🚀 in_progress', 'qualified', 'contacted', 'negotiating', 'paused') THEN 'in_progress'
  WHEN pipeline_stage IN ('🏆 won', 'converted', '✅ converted') THEN 'won'
  WHEN pipeline_stage IN ('❌ lost', 'lost') THEN 'lost'
  ELSE 'new'
END
WHERE pipeline_stage ~ '^[🚀🏆❌📥✅⏸️👀💬📞]|^(qualified|contacted|negotiating|paused|converted)$';

-- Update leads table status to ensure it uses slugs
UPDATE leads 
SET status = CASE
  WHEN status IN ('📥 new', 'new') THEN 'new'::pipeline_stage
  WHEN status IN ('👀 qualified', 'qualified') THEN 'qualified'::pipeline_stage
  WHEN status IN ('💬 contacted', 'contacted') THEN 'contacted'::pipeline_stage
  WHEN status IN ('📞 negotiating', 'negotiating') THEN 'negotiating'::pipeline_stage
  WHEN status IN ('✅ converted', '🏆 won', 'converted') THEN 'converted'::pipeline_stage
  WHEN status IN ('❌ lost', 'lost') THEN 'lost'::pipeline_stage
  WHEN status IN ('⏸️ paused', 'paused') THEN 'paused'::pipeline_stage
  ELSE 'new'::pipeline_stage
END
WHERE status ~ '^[🚀🏆❌📥✅⏸️👀💬📞]';

-- Ensure submitted_by is nullable for anonymous leads
ALTER TABLE public.leads ALTER COLUMN submitted_by DROP NOT NULL;

-- Update RLS policy for stricter anonymous lead submission
DROP POLICY IF EXISTS "Anonymous can create leads" ON public.leads;

CREATE POLICY "Anon can insert minimal lead"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  submitted_by IS NULL
  AND company_id IS NULL
  AND (status IS NULL OR status IN ('new','qualified','contacted','negotiating','converted','lost','paused'))
);