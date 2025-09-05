-- Fix handle_new_user to always set user_id and sane defaults, and backfill missing profiles
-- 1) Update the public.handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    user_id,
    full_name,
    role,
    metadata,
    notification_preferences,
    ui_preferences,
    feature_overrides
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(
      CASE lower(NULLIF(NEW.raw_user_meta_data->>'role',''))
        WHEN 'anonymous' THEN 'guest'
        WHEN 'member' THEN 'user'
        WHEN 'business' THEN 'company'
        WHEN 'provider' THEN 'company'
        WHEN 'editor' THEN 'content_editor'
        WHEN 'super_admin' THEN 'master_admin'
        ELSE lower(NULLIF(NEW.raw_user_meta_data->>'role',''))
      END,
      'user'
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      user_id = EXCLUDED.user_id,
      full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
      role = COALESCE(EXCLUDED.role, public.user_profiles.role),
      updated_at = now();

  RETURN NEW;
END;
$$;

-- 2) Backfill: ensure every auth user has a user_profiles row with user_id set
INSERT INTO public.user_profiles (
  id, user_id, full_name, role, metadata, notification_preferences, ui_preferences, feature_overrides
)
SELECT 
  au.id,
  au.id,
  au.raw_user_meta_data->>'full_name',
  COALESCE(
    CASE lower(NULLIF(au.raw_user_meta_data->>'role',''))
      WHEN 'anonymous' THEN 'guest'
      WHEN 'member' THEN 'user'
      WHEN 'business' THEN 'company'
      WHEN 'provider' THEN 'company'
      WHEN 'editor' THEN 'content_editor'
      WHEN 'super_admin' THEN 'master_admin'
      ELSE lower(NULLIF(au.raw_user_meta_data->>'role',''))
    END,
    'user'
  ),
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE up.id IS NULL;

-- 3) Repair any profiles where user_id might still be NULL
UPDATE public.user_profiles SET user_id = id WHERE user_id IS NULL;
