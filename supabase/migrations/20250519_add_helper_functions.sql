
-- Helper functions for feature flags and modules

-- Function to check if a feature flag is enabled for the current user
CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_role TEXT;
  random_value FLOAT;
BEGIN
  -- Get current user's role
  SELECT public.get_auth_user_role() INTO user_role;
  
  -- Check if the flag exists and is enabled
  SELECT 
    is_enabled, 
    percentage_rollout, 
    target_roles
  INTO flag_record
  FROM public.feature_flags
  WHERE name = flag_name;
  
  -- If flag doesn't exist or is disabled, return false
  IF NOT FOUND OR NOT flag_record.is_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user role is in target roles (if specified)
  IF flag_record.target_roles IS NOT NULL AND 
     array_length(flag_record.target_roles, 1) > 0 AND
     NOT (user_role = ANY(flag_record.target_roles)) THEN
    RETURN FALSE;
  END IF;
  
  -- Apply percentage rollout
  IF flag_record.percentage_rollout < 100 THEN
    -- Generate a deterministic random value based on user ID and flag name
    -- to ensure consistent experience for the same user
    random_value := abs(('x' || md5(auth.uid()::text || flag_name))::bit(32)::int / 2147483647.0::float);
    
    RETURN (random_value * 100) < flag_record.percentage_rollout;
  END IF;
  
  -- If we get here, the flag is enabled for this user
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get all enabled modules for the current user
CREATE OR REPLACE FUNCTION public.get_user_enabled_modules()
RETURNS TABLE (
  id UUID,
  name TEXT, 
  description TEXT,
  route TEXT,
  settings JSONB
) AS $$
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
  LEFT JOIN
    public.user_modules um ON sm.id = um.module_id AND um.user_id = auth.uid()
  WHERE
    sm.is_active = true AND
    (um.id IS NULL OR um.is_enabled = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if a user has access to a specific module
CREATE OR REPLACE FUNCTION public.has_module_access(module_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  module_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.get_user_enabled_modules()
    WHERE name = module_name
  ) INTO module_exists;
  
  RETURN module_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
