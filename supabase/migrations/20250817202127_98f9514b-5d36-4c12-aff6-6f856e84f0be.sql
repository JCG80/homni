-- Create test users in auth.users and user_profiles
-- Delete existing test users first to avoid conflicts
DELETE FROM auth.users WHERE email LIKE '%@test.local';

-- Insert test users into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@test.local',
    '$2a$10$V5YvnzfQPg/OZNmXCkqmAO4HqYTZyc8X7/7ggPQSlGGGPQKJZnOZu', -- password: 'admin123'
    now(),
    '{"role": "admin", "full_name": "Test Admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'master@test.local',
    '$2a$10$V5YvnzfQPg/OZNmXCkqmAO4HqYTZyc8X7/7ggPQSlGGGPQKJZnOZu', -- password: 'admin123'
    now(),
    '{"role": "master_admin", "full_name": "Test Master Admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'company@test.local',
    '$2a$10$V5YvnzfQPg/OZNmXCkqmAO4HqYTZyc8X7/7ggPQSlGGGPQKJZnOZu', -- password: 'admin123'
    now(),
    '{"role": "company", "full_name": "Test Company User"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'member@test.local',
    '$2a$10$V5YvnzfQPg/OZNmXCkqmAO4HqYTZyc8X7/7ggPQSlGGGPQKJZnOZu', -- password: 'admin123'
    now(),
    '{"role": "member", "full_name": "Test Member"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  )
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding user profiles
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
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Test Admin',
    'admin@test.local',
    'admin',
    '{"role": "admin"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Test Master Admin',
    'master@test.local',
    'master_admin',
    '{"role": "master_admin"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Test Company User',
    'company@test.local',
    'company',
    '{"role": "company"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'Test Member',
    'member@test.local',
    'member',
    '{"role": "member"}'::jsonb,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Insert user roles for proper role-based access
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'master_admin'),
  ('00000000-0000-0000-0000-000000000003', 'company'),
  ('00000000-0000-0000-0000-000000000004', 'member')
ON CONFLICT (user_id, role) DO NOTHING;