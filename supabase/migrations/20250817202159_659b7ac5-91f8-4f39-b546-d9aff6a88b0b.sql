-- Create test users for development (simplified approach)
-- Only insert into user_profiles since auth.users is managed differently

-- Delete existing test user profiles
DELETE FROM public.user_profiles WHERE email LIKE '%@test.local';

-- Insert test user profiles
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
    gen_random_uuid(),
    gen_random_uuid(),
    'Test Admin',
    'admin@test.local',
    'admin',
    '{"role": "admin"}'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    gen_random_uuid(),
    'Test Master Admin',
    'master@test.local',
    'master_admin',
    '{"role": "master_admin"}'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    gen_random_uuid(),
    'Test Company User',
    'company@test.local',
    'company',
    '{"role": "company"}'::jsonb,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    gen_random_uuid(),
    'Test Member',
    'member@test.local',
    'member',
    '{"role": "member"}'::jsonb,
    now(),
    now()
  );