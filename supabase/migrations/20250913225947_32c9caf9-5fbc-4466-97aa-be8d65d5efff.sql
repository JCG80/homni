-- Update user_profiles with correct email addresses
UPDATE public.user_profiles 
SET email = (SELECT email FROM auth.users WHERE auth.users.id = user_profiles.user_id)
WHERE email IS NULL AND user_id IS NOT NULL;