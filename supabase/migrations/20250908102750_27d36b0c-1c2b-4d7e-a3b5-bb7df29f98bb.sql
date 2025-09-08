-- Add missing customer contact fields to leads table (safe, non-breaking)
-- Note: Avoid CONCURRENTLY inside transactional migrations

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT, 
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- PII/GDPR annotations
COMMENT ON COLUMN public.leads.customer_name IS 'PII: Customer full name, must be deletable for GDPR compliance';
COMMENT ON COLUMN public.leads.customer_email IS 'PII: Customer email address, must be deletable for GDPR compliance';  
COMMENT ON COLUMN public.leads.customer_phone IS 'PII: Customer phone number, must be deletable for GDPR compliance';

-- Create indexes (non-concurrent due to transactional context)
CREATE INDEX IF NOT EXISTS idx_leads_customer_email ON public.leads(customer_email);
CREATE INDEX IF NOT EXISTS idx_leads_customer_phone ON public.leads(customer_phone);

-- Backfill from metadata keys if present
UPDATE public.leads 
SET 
  customer_name = COALESCE(customer_name, metadata->>'customer_name', metadata->>'contact_name'),
  customer_email = COALESCE(customer_email, metadata->>'customer_email', metadata->>'email'),
  customer_phone = COALESCE(customer_phone, metadata->>'customer_phone', metadata->>'phone')
WHERE metadata IS NOT NULL
  AND (
    metadata->>'customer_name' IS NOT NULL OR 
    metadata->>'customer_email' IS NOT NULL OR 
    metadata->>'customer_phone' IS NOT NULL OR
    metadata->>'contact_name' IS NOT NULL OR
    metadata->>'email' IS NOT NULL OR
    metadata->>'phone' IS NOT NULL
  );
