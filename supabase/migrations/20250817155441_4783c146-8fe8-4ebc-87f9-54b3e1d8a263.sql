-- Fix critical search_path and SECURITY DEFINER issues in all functions
-- This ensures all functions are properly secured and use correct search paths

-- 1) Fix get_auth_user_role function
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  -- Prefer role from user_profiles
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;

  -- Fallback to auth.users raw metadata
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'member');
END;
$function$;

-- 2) Fix has_module_access function
CREATE OR REPLACE FUNCTION public.has_module_access(module_name text, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  module_access_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.user_modules um
    JOIN public.system_modules sm ON um.module_id = sm.id
    WHERE um.user_id = user_id
    AND sm.name = module_name
    AND um.is_enabled = true
  ) INTO module_access_exists;
  
  RETURN module_access_exists;
END;
$function$;

-- 3) Fix get_user_enabled_modules function
CREATE OR REPLACE FUNCTION public.get_user_enabled_modules(user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(id uuid, name text, description text, route text, settings jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.name,
    sm.description,
    sm.route,
    COALESCE(um.settings, '{}'::jsonb) AS settings
  FROM 
    public.system_modules sm
  INNER JOIN
    public.user_modules um ON sm.id = um.module_id
  WHERE
    um.user_id = user_id AND
    um.is_enabled = true;
END;
$function$;

-- 4) Fix is_feature_enabled function
CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_name text, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
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

-- 5) Fix get_current_user_company_id function
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid();
$function$;

-- 6) Fix is_plugin_enabled function
CREATE OR REPLACE FUNCTION public.is_plugin_enabled(plugin_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  plugin_status BOOLEAN;
BEGIN
  SELECT is_enabled INTO plugin_status
  FROM public.plugin_manifests
  WHERE name = plugin_name;
  
  RETURN COALESCE(plugin_status, false);
END;
$function$;

-- 7) Fix get_enabled_plugins function
CREATE OR REPLACE FUNCTION public.get_enabled_plugins()
 RETURNS TABLE(id uuid, name text, version text, description text, entry_point text, metadata jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.name,
    pm.version,
    pm.description,
    pm.entry_point,
    pm.metadata
  FROM 
    public.plugin_manifests pm
  WHERE
    pm.is_enabled = true;
END;
$function$;