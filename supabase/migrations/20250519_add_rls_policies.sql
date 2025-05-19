
-- Row Level Security (RLS) policies for the new tables

-- 1. Enable RLS on all new tables
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check user role without recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from user metadata if available
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. User Module Policies (similar pattern to existing module_access policies)
-- Users can view their own module settings
CREATE POLICY "Users can view their own modules"
ON public.user_modules
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own module settings
CREATE POLICY "Users can update their own modules"
ON public.user_modules
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all user modules
CREATE POLICY "Admins can view all user modules"
ON public.user_modules
FOR SELECT
USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- Admins can insert user modules
CREATE POLICY "Admins can insert user modules"
ON public.user_modules
FOR INSERT
WITH CHECK (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- Admins can update any user modules
CREATE POLICY "Admins can update any user modules"
ON public.user_modules
FOR UPDATE
USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- Admins can delete user modules
CREATE POLICY "Admins can delete user modules"
ON public.user_modules
FOR DELETE
USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- 4. Service Module Policies
-- All authenticated users can view service modules (public information)
CREATE POLICY "Authenticated users can view service modules"
ON public.service_modules
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can modify service modules
CREATE POLICY "Admins can manage service modules"
ON public.service_modules
FOR ALL
USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- 5. Module Dependencies Policies (system data, admin only except for viewing)
-- All authenticated users can view module dependencies
CREATE POLICY "Authenticated users can view module dependencies"
ON public.module_dependencies
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can modify module dependencies
CREATE POLICY "Admins can manage module dependencies"
ON public.module_dependencies
FOR ALL
USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- 6. Feature Flags Policies
-- Authenticated users can view feature flags
CREATE POLICY "Authenticated users can view applicable feature flags"
ON public.feature_flags
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  (
    target_roles IS NULL OR 
    array_length(target_roles, 1) IS NULL OR
    public.get_auth_user_role() = ANY(target_roles)
  )
);

-- Only admins can modify feature flags
CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (public.get_auth_user_role() IN ('admin', 'master_admin'));
