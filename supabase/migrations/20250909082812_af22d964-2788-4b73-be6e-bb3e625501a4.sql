-- Fix user_modules table and policies for proper internal access management
-- The existing user_modules table looks good, let's just ensure we have proper policies

-- Update user_profiles to better support internal admin functionality
-- Add function to check if user is internal admin
CREATE OR REPLACE FUNCTION public.is_internal_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = check_user_id 
    AND (metadata->>'internal_admin')::boolean = true
  );
END;
$$;

-- Function to get users with internal admin access
CREATE OR REPLACE FUNCTION public.get_internal_admins()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  metadata jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only master_admin can call this function
  IF NOT (get_auth_user_role() = 'master_admin') THEN
    RAISE EXCEPTION 'Access denied: Only master admins can view internal admins';
  END IF;
  
  RETURN QUERY
  SELECT 
    up.id,
    up.full_name,
    up.email,
    up.metadata,
    up.created_at
  FROM public.user_profiles up
  WHERE (up.metadata->>'internal_admin')::boolean = true
  ORDER BY up.created_at DESC;
END;
$$;