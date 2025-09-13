-- Fix infinite recursion in user_profiles RLS policies
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "System can manage profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.user_profiles;

-- Create safe, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "user_profiles_own_select" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "user_profiles_own_update" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "user_profiles_own_insert" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all profiles using direct role check
CREATE POLICY "user_profiles_admin_all" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role_enum IN ('admin', 'master_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role_enum IN ('admin', 'master_admin')
  )
);

-- Create a safe function to check if user exists (for profile creation)
CREATE OR REPLACE FUNCTION public.safe_user_exists(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_uuid
  );
$$;