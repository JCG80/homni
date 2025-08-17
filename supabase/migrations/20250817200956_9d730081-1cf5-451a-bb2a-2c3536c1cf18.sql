-- Fix pipeline_stage enum to use slugs instead of emojis

-- Create pipeline_stage enum with slug values if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_stage') THEN
    CREATE TYPE pipeline_stage AS ENUM ('new','in_progress','won','lost');
  END IF;
END$$;

-- Update lead_assignments table to use slug values (cast to text first)
UPDATE lead_assignments 
SET pipeline_stage = CASE
  WHEN pipeline_stage::text IN ('📥 new', 'new') THEN 'new'::pipeline_stage
  WHEN pipeline_stage::text IN ('🚀 in_progress', 'qualified', 'contacted', 'negotiating', 'paused') THEN 'in_progress'::pipeline_stage
  WHEN pipeline_stage::text IN ('🏆 won', 'converted', '✅ converted') THEN 'won'::pipeline_stage
  WHEN pipeline_stage::text IN ('❌ lost', 'lost') THEN 'lost'::pipeline_stage
  ELSE 'new'::pipeline_stage
END
WHERE pipeline_stage::text ~ '^[🚀🏆❌📥✅⏸️👀💬📞]|^(qualified|contacted|negotiating|paused|converted)$';

-- Update leads table status to ensure it uses slugs
UPDATE leads 
SET status = CASE
  WHEN status::text IN ('📥 new', 'new') THEN 'new'::pipeline_stage
  WHEN status::text IN ('👀 qualified', 'qualified') THEN 'qualified'::pipeline_stage
  WHEN status::text IN ('💬 contacted', 'contacted') THEN 'contacted'::pipeline_stage
  WHEN status::text IN ('📞 negotiating', 'negotiating') THEN 'negotiating'::pipeline_stage
  WHEN status::text IN ('✅ converted', '🏆 won', 'converted') THEN 'converted'::pipeline_stage
  WHEN status::text IN ('❌ lost', 'lost') THEN 'lost'::pipeline_stage
  WHEN status::text IN ('⏸️ paused', 'paused') THEN 'paused'::pipeline_stage
  ELSE 'new'::pipeline_stage
END
WHERE status::text ~ '^[🚀🏆❌📥✅⏸️👀💬📞]';

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