-- Insert missing user profiles for existing auth users
INSERT INTO public.user_profiles (
  id,
  user_id,
  full_name,
  email,
  role,
  metadata,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  au.id,
  au.raw_user_meta_data->>'full_name',
  au.email,
  au.raw_user_meta_data->>'role',
  ('{"role": "' || (au.raw_user_meta_data->>'role') || '"}')::jsonb,
  au.created_at,
  now()
FROM auth.users au
WHERE au.email LIKE '%@test.local'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles up 
  WHERE up.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Also insert corresponding user roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  (au.raw_user_meta_data->>'role')::app_role
FROM auth.users au
WHERE au.email LIKE '%@test.local'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id
)
ON CONFLICT (user_id, role) DO NOTHING;