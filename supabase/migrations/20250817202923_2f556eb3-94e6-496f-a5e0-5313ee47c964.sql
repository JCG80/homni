-- Update existing profiles to ensure they have proper roles
UPDATE public.user_profiles 
SET 
  role = CASE 
    WHEN email = 'admin@test.local' THEN 'admin'
    WHEN email = 'master-admin@test.local' THEN 'master_admin'
    WHEN email = 'company@test.local' THEN 'company'
    WHEN email = 'user@test.local' THEN 'member'
    ELSE 'member'
  END,
  metadata = CASE 
    WHEN email = 'admin@test.local' THEN '{"role": "admin"}'::jsonb
    WHEN email = 'master-admin@test.local' THEN '{"role": "master_admin"}'::jsonb
    WHEN email = 'company@test.local' THEN '{"role": "company"}'::jsonb
    WHEN email = 'user@test.local' THEN '{"role": "member"}'::jsonb
    ELSE '{"role": "member"}'::jsonb
  END,
  full_name = CASE 
    WHEN email = 'admin@test.local' THEN 'Test Admin'
    WHEN email = 'master-admin@test.local' THEN 'Test Master Admin'
    WHEN email = 'company@test.local' THEN 'Test Company'
    WHEN email = 'user@test.local' THEN 'Test Member'
    ELSE 'Test User'
  END,
  updated_at = now()
WHERE email LIKE '%@test.local';

-- Ensure user_roles exist
INSERT INTO public.user_roles (user_id, role) 
SELECT 
  up.id,
  up.role::app_role
FROM public.user_profiles up
WHERE up.email LIKE '%@test.local'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id AND ur.role = up.role::app_role
);