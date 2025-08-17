-- Backfill missing profiles and roles for test users to unblock auth and navigation

-- 1) Ensure profiles exist for all @test.local users, default to member when role null
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
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'member'),
  jsonb_build_object('role', COALESCE(au.raw_user_meta_data->>'role', 'member')),
  au.created_at,
  now()
FROM auth.users au
WHERE au.email LIKE '%@test.local'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- 2) Upsert role into user_profiles if row already exists but role is null
UPDATE public.user_profiles up
SET role = COALESCE(up.role, 'member'),
    metadata = up.metadata || jsonb_build_object('role', COALESCE(up.role, 'member')),
    updated_at = now()
WHERE up.email LIKE '%@test.local' AND (up.role IS NULL OR up.role = '');

-- 3) Insert user_roles with valid enum values; default to member when unknown/null
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  (
    CASE 
      WHEN (au.raw_user_meta_data->>'role') IN ('admin','master_admin','company','content_editor','member')
        THEN (au.raw_user_meta_data->>'role')::app_role
      ELSE 'member'::app_role
    END
  )
FROM auth.users au
WHERE au.email LIKE '%@test.local'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
);
