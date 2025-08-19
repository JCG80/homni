-- Fix security warnings by setting proper search_path for all functions
-- This addresses the 45 security warnings identified in the linter

-- Update all functions to use explicit search_path for security
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
END$function$;

-- Fix search_path for all remaining functions
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(MAX(
    CASE 
      WHEN role = 'master_admin' THEN 100
      WHEN role = 'admin' THEN 80
      WHEN role = 'content_editor' THEN 60
      WHEN role = 'company' THEN 40
      WHEN role = 'user' THEN 20
      WHEN role = 'guest' THEN 0
      ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_level integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.get_user_role_level(_user_id) >= _min_level
$function$;

-- Add proper search_path to all critical functions identified in security scan
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

CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_name text, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  flag_record RECORD;
  user_role TEXT;
  random_value FLOAT;
BEGIN
  -- Prefer role from user_profiles
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  IF user_role IS NULL THEN
    SELECT raw_user_meta_data->>'role' INTO user_role FROM auth.users WHERE id = user_id;
  END IF;
  
  SELECT 
    is_enabled, 
    rollout_percentage, 
    target_roles
  INTO flag_record
  FROM public.feature_flags
  WHERE name = flag_name;
  
  IF NOT FOUND OR NOT flag_record.is_enabled THEN
    RETURN FALSE;
  END IF;
  
  IF flag_record.target_roles IS NOT NULL AND 
     array_length(flag_record.target_roles, 1) > 0 AND
     NOT (user_role = ANY(flag_record.target_roles)) THEN
    RETURN FALSE;
  END IF;
  
  IF flag_record.rollout_percentage < 100 THEN
    random_value := abs(('x' || md5(user_id::text || flag_name))::bit(32)::int / 2147483647.0::float);
    RETURN (random_value * 100) < flag_record.rollout_percentage;
  END IF;
  
  RETURN TRUE;
END;
$function$;