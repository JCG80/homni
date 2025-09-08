-- Add missing customer contact fields to leads table
-- These fields are already used throughout the codebase but missing from DB schema

-- Add customer contact fields as nullable to avoid breaking existing data
ALTER TABLE public.leads 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_email TEXT, 
ADD COLUMN customer_phone TEXT;

-- Add comments for PII/GDPR compliance
COMMENT ON COLUMN public.leads.customer_name IS 'PII: Customer full name, must be deletable for GDPR compliance';
COMMENT ON COLUMN public.leads.customer_email IS 'PII: Customer email address, must be deletable for GDPR compliance';  
COMMENT ON COLUMN public.leads.customer_phone IS 'PII: Customer phone number, must be deletable for GDPR compliance';

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_customer_email ON public.leads(customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_customer_phone ON public.leads(customer_phone) WHERE customer_phone IS NOT NULL;

-- Migrate existing customer data from metadata to direct columns (if any exists)
UPDATE public.leads 
SET 
  customer_name = COALESCE(customer_name, metadata->>'customer_name', metadata->>'contact_name'),
  customer_email = COALESCE(customer_email, metadata->>'customer_email', metadata->>'email'),
  customer_phone = COALESCE(customer_phone, metadata->>'customer_phone', metadata->>'phone')
WHERE metadata IS NOT NULL
  AND (metadata->>'customer_name' IS NOT NULL OR metadata->>'customer_email' IS NOT NULL OR metadata->>'customer_phone' IS NOT NULL);

-- RLS policies will automatically apply to new columns since they use table-level policies
-- No additional RLS changes needed - existing policies cover all columns