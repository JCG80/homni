-- Fix remaining functions to include SET search_path = public
-- Update all SECURITY DEFINER functions that are missing search_path

-- Fix get_auth_user_role function
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  r text;
begin
  -- Prefer user_roles with role precedence (canonical roles)
  select ur.role::text into r
  from public.user_roles ur
  where ur.user_id = auth.uid()
  order by case ur.role
    when 'master_admin' then 1
    when 'admin' then 2
    when 'company' then 3
    when 'content_editor' then 4
    when 'user' then 5
    else 100
  end
  limit 1;

  if r is not null then
    return r;
  end if;

  -- Fallback to user_profiles.role (normalize legacy values)
  select up.role into r
  from public.user_profiles up
  where up.id = auth.uid();

  if r is not null then
    r := lower(r);
    if r = 'member' then
      r := 'user';
    elsif r = 'anonymous' then
      r := 'guest';
    end if;
    return r;
  end if;

  -- Fallback to auth.users raw metadata (normalize legacy values)
  select lower(au.raw_user_meta_data->>'role') into r
  from auth.users au
  where au.id = auth.uid();

  if r is not null then
    if r = 'member' then
      r := 'user';
    elsif r = 'anonymous' then
      r := 'guest';
    end if;
    return r;
  end if;

  -- Default canonical role
  return 'user';
end;
$function$;

-- Fix ensure_user_profile function
CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id uuid, p_role text DEFAULT NULL::text, p_company_id uuid DEFAULT NULL::uuid)
 RETURNS user_profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
  v_row public.user_profiles;
BEGIN
  -- Normalise role to canonical values
  v_role := COALESCE(
    CASE lower(coalesce(p_role, 'user'))
      WHEN 'anonymous' THEN 'guest'
      WHEN 'guest' THEN 'guest'
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
    'user'
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
END$function$;