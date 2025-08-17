-- Create test users for authentication testing
-- First check if user_profiles table has the correct structure
DO $$
BEGIN
    -- Insert user profiles directly (the auth.users should be handled via Supabase auth)
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
END $$;