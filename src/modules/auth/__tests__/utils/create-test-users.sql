
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
  '{"role":"member", "full_name":"Test User"}'::jsonb
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

-- Create user with 'master_admin' role
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'master-admin@test.local',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"role":"master_admin", "full_name":"Test Master Admin"}'::jsonb
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
INSERT INTO public.user_profiles (
  id, 
  full_name, 
  email, 
  phone, 
  address, 
  region, 
  profile_picture_url, 
  metadata, 
  preferences
)
SELECT 
  id, 
  raw_user_meta_data->>'full_name',
  email,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'member' THEN '+47 55544333'
    WHEN raw_user_meta_data->>'role' = 'company' THEN '+47 22334455'
    WHEN raw_user_meta_data->>'role' = 'admin' THEN '+47 99988777'
    WHEN raw_user_meta_data->>'role' = 'master_admin' THEN '+47 12345678'
    ELSE '+47 00000000'
  END,
  CASE 
    WHEN raw_user_meta_data->>'role' = 'member' THEN 'Testveien 1, 0123 Oslo'
    WHEN raw_user_meta_data->>'role' = 'company' THEN 'Bedriftsveien 10, 0123 Oslo'
    WHEN raw_user_meta_data->>'role' = 'admin' THEN 'Adminveien 5, 0123 Oslo'
    WHEN raw_user_meta_data->>'role' = 'master_admin' THEN 'Masterveien 10, 0123 Oslo'
    ELSE 'Ukjent adresse'
  END,
  'Oslo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || raw_user_meta_data->>'role',
  json_build_object('role', raw_user_meta_data->>'role'),
  CASE 
    WHEN raw_user_meta_data->>'role' = 'member' THEN '{"theme": "light", "notifications": true, "language": "no"}'::jsonb
    WHEN raw_user_meta_data->>'role' = 'admin' THEN '{"theme": "dark", "notifications": true, "language": "no", "adminView": "advanced"}'::jsonb
    WHEN raw_user_meta_data->>'role' = 'master_admin' THEN '{"theme": "system", "notifications": true, "language": "no", "adminView": "full", "developerMode": true}'::jsonb
    ELSE '{}'::jsonb
  END
FROM auth.users 
WHERE email LIKE '%@test.local'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  region = EXCLUDED.region,
  profile_picture_url = EXCLUDED.profile_picture_url,
  metadata = EXCLUDED.metadata,
  preferences = EXCLUDED.preferences;

-- Create company profile for company user
INSERT INTO public.company_profiles (
  name,
  user_id,
  status,
  contact_name,
  email,
  phone,
  industry,
  subscription_plan,
  modules_access
)
SELECT 
  'Test Company AS',
  id,
  'active',
  'Test Company Contact',
  'company@test.local',
  '+47 22334455',
  'Construction',
  'standard',
  ARRAY['leads', 'profile', 'reports']
FROM auth.users 
WHERE email = 'company@test.local'
ON CONFLICT (id) DO NOTHING;

-- Verify test users were created
SELECT email, raw_user_meta_data
FROM auth.users
WHERE email LIKE '%@test.local';
