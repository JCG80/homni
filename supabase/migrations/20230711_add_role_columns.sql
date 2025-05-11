
-- Add role management columns to user profiles
ALTER TABLE IF EXISTS public.user_profiles 
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS internal_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS module_access TEXT[] NOT NULL DEFAULT '{}';

-- Create an index for faster lookups by account_type
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);

-- Update existing users to have default values
UPDATE public.user_profiles
SET 
  account_type = 'member',
  internal_admin = FALSE,
  module_access = '{}'
WHERE account_type IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.account_type IS 'User account type: member, company, admin, master_admin';
COMMENT ON COLUMN public.user_profiles.internal_admin IS 'Flag indicating if user has internal admin privileges';
COMMENT ON COLUMN public.user_profiles.module_access IS 'Array of module names the user has access to';
