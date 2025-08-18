-- Fix ensure_user_profile function to handle both id and user_id columns correctly
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id uuid,
  p_role text DEFAULT NULL,
  p_company_id uuid DEFAULT NULL
) RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_row public.user_profiles;
BEGIN
  -- Normalise role to canonical values
  v_role := COALESCE(
    CASE lower(coalesce(p_role, 'anonymous'))
      WHEN 'anonymous' THEN 'anonymous'
      WHEN 'guest' THEN 'anonymous'
      WHEN 'member' THEN 'user'
      WHEN 'regular' THEN 'user'
      WHEN 'basic' THEN 'user'
      WHEN 'business' THEN 'company'
      WHEN 'provider' THEN 'company'
      WHEN 'editor' THEN 'content_editor'
      WHEN 'moderator' THEN 'content_editor'
      WHEN 'super_admin' THEN 'master_admin'
      WHEN 'root' THEN 'master_admin'
      ELSE p_role
    END,
    'anonymous'
  );

  -- Insert or update profile with both id and user_id set to the same value
  INSERT INTO public.user_profiles (
    id, 
    user_id, 
    role, 
    company_id,
    metadata,
    notification_preferences,
    ui_preferences,
    feature_overrides
  )
  VALUES (
    p_user_id, 
    p_user_id, 
    v_role, 
    p_company_id,
    '{}',
    '{}',
    '{}',
    '{}'
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      user_id = p_user_id,
      role = EXCLUDED.role,
      company_id = COALESCE(EXCLUDED.company_id, public.user_profiles.company_id),
      updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END$$;