-- Fix pipeline_stage enum to use slugs instead of emojis

-- First check what type the status column uses
-- Update lead_assignments table pipeline_stage to use slug values
UPDATE lead_assignments 
SET pipeline_stage = CASE
  WHEN pipeline_stage::text = '📥 new' THEN 'new'
  WHEN pipeline_stage::text = '🚀 in_progress' THEN 'in_progress'
  WHEN pipeline_stage::text = '🏆 won' THEN 'won'
  WHEN pipeline_stage::text = '❌ lost' THEN 'lost'
  ELSE pipeline_stage
END
WHERE pipeline_stage::text ~ '^[🚀🏆❌📥]';

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