-- Add missing fields for public insurance directory
ALTER TABLE public.insurance_companies 
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS sort_index integer DEFAULT 0;

-- Create unique constraint on slug (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'insurance_companies_slug_key') THEN
    ALTER TABLE public.insurance_companies ADD CONSTRAINT insurance_companies_slug_key UNIQUE (slug);
  END IF;
END$$;

-- Create index for public queries
CREATE INDEX IF NOT EXISTS idx_insurance_companies_public 
  ON public.insurance_companies (is_published, sort_index);

-- Drop existing policy if it exists and create new one for public access
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
CREATE POLICY "Public read published insurance companies" 
  ON public.insurance_companies
  FOR SELECT 
  USING (is_published = true);

-- Generate slugs for existing companies based on their names
UPDATE public.insurance_companies 
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(name, 'ø', 'o', 'g'), 
        'æ', 'ae', 'g'
      ), 
      'å', 'a', 'g'
    ), 
    '[^a-z0-9]+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Add feature flag for insurance directory
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage, target_roles)
VALUES (
  'feature_insurance_directory',
  'Enable the public insurance companies directory at /forsikring/selskaper',
  true,
  100,
  '{}'::text[]
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled;