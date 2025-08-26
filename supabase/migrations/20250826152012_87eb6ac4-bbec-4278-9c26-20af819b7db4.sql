-- Add confirmation_email_sent_at to leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;

-- Helpful index for email lookups (already common usage)
CREATE INDEX IF NOT EXISTS idx_leads_anonymous_email ON public.leads (lower(anonymous_email));
