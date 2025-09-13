-- First, ensure the test users exist in user_profiles
INSERT INTO public.user_profiles (id, user_id, full_name, email, role, role_enum, metadata)
SELECT 
  u.id, 
  u.id,
  CASE 
    WHEN u.email = 'master@homni.no' THEN 'Master Administrator'
    WHEN u.email = 'user@homni.no' THEN 'Test User'
    WHEN u.email = 'admin@homni.no' THEN 'Administrator'
    WHEN u.email = 'company@homni.no' THEN 'Company User'
  END as full_name,
  u.email,
  CASE 
    WHEN u.email = 'master@homni.no' THEN 'master_admin'
    WHEN u.email = 'user@homni.no' THEN 'user'
    WHEN u.email = 'admin@homni.no' THEN 'admin'  
    WHEN u.email = 'company@homni.no' THEN 'company'
  END as role,
  CASE 
    WHEN u.email = 'master@homni.no' THEN 'master_admin'::app_role
    WHEN u.email = 'user@homni.no' THEN 'user'::app_role
    WHEN u.email = 'admin@homni.no' THEN 'admin'::app_role
    WHEN u.email = 'company@homni.no' THEN 'company'::app_role
  END as role_enum,
  jsonb_build_object(
    'allowed_modes', CASE 
      WHEN u.email = 'master@homni.no' THEN '["personal", "professional"]'::jsonb
      WHEN u.email = 'user@homni.no' THEN '["personal"]'::jsonb
      WHEN u.email = 'admin@homni.no' THEN '["personal", "professional"]'::jsonb
      WHEN u.email = 'company@homni.no' THEN '["professional"]'::jsonb
    END,
    'roles', CASE 
      WHEN u.email = 'master@homni.no' THEN '["user", "master_admin"]'::jsonb
      WHEN u.email = 'user@homni.no' THEN '["user"]'::jsonb
      WHEN u.email = 'admin@homni.no' THEN '["user", "admin"]'::jsonb
      WHEN u.email = 'company@homni.no' THEN '["company"]'::jsonb
    END,
    'active_mode', 'personal',
    'primary_user_email', CASE 
      WHEN u.email = 'master@homni.no' THEN 'user@homni.no'
      ELSE u.email
    END
  ) as metadata
FROM auth.users u
WHERE u.email IN ('master@homni.no', 'user@homni.no', 'admin@homni.no', 'company@homni.no')
ON CONFLICT (id) 
DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  role_enum = EXCLUDED.role_enum,
  metadata = EXCLUDED.metadata,
  updated_at = now();