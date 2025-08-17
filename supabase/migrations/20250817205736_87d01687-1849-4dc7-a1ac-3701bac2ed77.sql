-- Update lead_assignments table to use canonical slugs and map legacy values
-- Add temporary column for new pipeline stage
ALTER TABLE public.lead_assignments 
ADD COLUMN IF NOT EXISTS new_pipeline_stage pipeline_stage DEFAULT 'new';

-- Map existing emoji values to canonical slugs
UPDATE public.lead_assignments 
SET new_pipeline_stage = CASE 
  WHEN pipeline_stage::text ~ '📥|new' THEN 'new'::pipeline_stage
  WHEN pipeline_stage::text ~ '🚀|qualified|contacted|negotiating|paused|in_progress' THEN 'in_progress'::pipeline_stage
  WHEN pipeline_stage::text ~ '🏆|✅|converted|won' THEN 'won'::pipeline_stage
  WHEN pipeline_stage::text ~ '❌|lost' THEN 'lost'::pipeline_stage
  ELSE 'new'::pipeline_stage
END
WHERE new_pipeline_stage IS NULL OR new_pipeline_stage = 'new';

-- Drop old column and rename new one (only if not already done)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_assignments' AND column_name = 'pipeline_stage' AND data_type != 'USER-DEFINED') THEN
    ALTER TABLE public.lead_assignments DROP COLUMN pipeline_stage;
    ALTER TABLE public.lead_assignments RENAME COLUMN new_pipeline_stage TO pipeline_stage;
  END IF;
END $$;

-- Make leads.submitted_by nullable for anonymous submissions (if not already nullable)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'leads' 
             AND column_name = 'submitted_by' 
             AND is_nullable = 'NO') THEN
    ALTER TABLE public.leads ALTER COLUMN submitted_by DROP NOT NULL;
  END IF;
END $$;

-- Update RLS policy for anonymous lead insertion with stricter checks
DROP POLICY IF EXISTS "Anonymous can create leads" ON public.leads;
CREATE POLICY "Anonymous can create leads with safe values" 
ON public.leads 
FOR INSERT 
TO anon
WITH CHECK (
  submitted_by IS NULL 
  AND company_id IS NULL 
  AND (status IS NULL OR status::text IN ('new', 'qualified', 'contacted', 'negotiating', 'converted', 'lost', 'paused'))
  AND title IS NOT NULL 
  AND description IS NOT NULL 
  AND category IS NOT NULL
);