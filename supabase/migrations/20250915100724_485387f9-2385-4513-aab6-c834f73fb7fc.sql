-- Create security settings table with RLS
CREATE TABLE IF NOT EXISTS public.security_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  otp_bypass_code TEXT,
  enforce_bypass_only_in_dev BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on security_settings
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for security_settings (master_admin only)
CREATE POLICY "security_settings_master_admin_only" 
ON public.security_settings
FOR ALL 
USING (public.has_role_level(auth.uid(), 100));

-- Insert default security settings for development
INSERT INTO public.security_settings (id, otp_bypass_code, enforce_bypass_only_in_dev)
VALUES (TRUE, '000000', TRUE)
ON CONFLICT (id) DO UPDATE SET
  otp_bypass_code = EXCLUDED.otp_bypass_code,
  enforce_bypass_only_in_dev = EXCLUDED.enforce_bypass_only_in_dev;