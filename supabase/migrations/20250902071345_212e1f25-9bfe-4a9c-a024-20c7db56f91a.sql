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

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Public read published insurance companies" ON public.insurance_companies;
CREATE POLICY "Public read published insurance companies" 
  ON public.insurance_companies
  FOR SELECT 
  USING (
    is_published = true
    AND (deleted_at IS NULL)
  );

-- Generate slugs for existing companies
UPDATE public.insurance_companies 
SET slug = CASE 
  WHEN name = 'If' THEN 'if'
  WHEN name = 'Gjensidige' THEN 'gjensidige'  
  WHEN name = 'Tryg' THEN 'tryg'
  WHEN name = 'Storebrand' THEN 'storebrand'
  WHEN name = 'Fremtind' THEN 'fremtind'
  ELSE lower(regexp_replace(regexp_replace(name, '[øæå]', '', 'g'), '[^a-z0-9]+', '-', 'g'))
END
WHERE slug IS NULL;