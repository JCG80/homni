
-- Script to create test users for the Homni platform
-- This script should be run in the Supabase SQL Editor

-- Clean up existing test users first to avoid duplicates
DELETE FROM auth.users WHERE email LIKE '%@test.local';

-- Create user with 'user' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'user@test.local',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"role":"user", "full_name":"Test User"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Create user with 'company' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'company@test.local',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"role":"company", "full_name":"Test Company"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Create user with 'admin' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'admin@test.local',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"role":"admin", "full_name":"Test Admin"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Create user with 'master-admin' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'master-admin@test.local',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"role":"master-admin", "full_name":"Test Master Admin"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Create user with 'provider' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'provider@test.local',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"role":"provider", "full_name":"Test Provider"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Create user profiles for all test users
INSERT INTO public.user_profiles (id, full_name)
SELECT id, raw_user_meta_data->>'full_name' 
FROM auth.users 
WHERE email LIKE '%@test.local'
ON CONFLICT (id) DO NOTHING;

-- Verify test users were created
SELECT email, raw_user_meta_data
FROM auth.users
WHERE email LIKE '%@test.local';
