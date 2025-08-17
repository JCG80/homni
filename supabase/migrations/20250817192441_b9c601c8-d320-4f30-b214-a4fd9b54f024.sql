-- Make submitted_by nullable to allow anonymous lead creation
ALTER TABLE public.leads
  ALTER COLUMN submitted_by DROP NOT NULL;

-- No changes to RLS needed; existing policies already handle anon inserts and user-owned leads.
