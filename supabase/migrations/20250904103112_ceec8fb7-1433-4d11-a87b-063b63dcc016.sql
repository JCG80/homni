-- Fix lead_history table structure
ALTER TABLE public.lead_history 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Test the distribution function now
SELECT * FROM public.distribute_new_lead_v3('dacb205e-2f4f-49bd-a2af-4891bd428a99'::uuid);