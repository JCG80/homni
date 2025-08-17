-- Fix test users by creating proper profiles with correct roles
-- First, clean up any incomplete data
DELETE FROM public.user_profiles WHERE email LIKE '%@test.local';
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@test.local'
);

-- Insert proper user profiles with correct roles based on email
INSERT INTO public.user_profiles (
  id,
  user_id,
  full_name,
  email,
  role,
  metadata,
  created_at,
  updated_at
) VALUES
  (
    (SELECT id FROM auth.users WHERE email = 'admin@test.local'),
    (SELECT id FROM auth.users WHERE email = 'admin@test.local'),
    'Test Admin',
    'admin@test.local',
    'admin',
    '{"role": "admin"}'::jsonb,
    now(),
    now()
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'master-admin@test.local'),
    (SELECT id FROM auth.users WHERE email = 'master-admin@test.local'),
    'Test Master Admin',
    'master-admin@test.local',
    'master_admin',
    '{"role": "master_admin"}'::jsonb,
    now(),
    now()
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'company@test.local'),
    (SELECT id FROM auth.users WHERE email = 'company@test.local'),
    'Test Company',
    'company@test.local',
    'company',
    '{"role": "company"}'::jsonb,
    now(),
    now()
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'user@test.local'),
    (SELECT id FROM auth.users WHERE email = 'user@test.local'),
    'Test Member',
    'user@test.local',
    'member',
    '{"role": "member"}'::jsonb,
    now(),
    now()
  );

-- Insert corresponding user roles
INSERT INTO public.user_roles (user_id, role) VALUES
  ((SELECT id FROM auth.users WHERE email = 'admin@test.local'), 'admin'),
  ((SELECT id FROM auth.users WHERE email = 'master-admin@test.local'), 'master_admin'),
  ((SELECT id FROM auth.users WHERE email = 'company@test.local'), 'company'),
  ((SELECT id FROM auth.users WHERE email = 'user@test.local'), 'member');