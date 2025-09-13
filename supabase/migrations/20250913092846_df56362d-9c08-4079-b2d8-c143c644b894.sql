-- Fix critical RLS security issues for user_profiles table
-- Ensure proper RLS policies are in place for user profile management

-- First, let's check if user_profiles table has proper RLS policies
-- Update RLS policies for user_profiles to ensure secure access

-- Users can only view and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create secure RLS policies for user_profiles
CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

-- Admins and master_admins can manage all profiles
CREATE POLICY "Admins can manage all profiles" 
ON public.user_profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'master_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'master_admin')
  )
);

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- Ensure properties table has secure RLS
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
CREATE POLICY "Users can view own properties"
ON public.properties
FOR SELECT
USING (auth.uid() = user_id);

-- Fix leads table RLS for proper user access
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" 
ON public.leads 
FOR SELECT 
USING (
  auth.uid() = submitted_by 
  OR (
    anonymous_email IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND lower(email) = lower(anonymous_email)
    )
  )
);

-- Allow users to create their own leads
CREATE POLICY "Users can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (auth.uid() = submitted_by OR submitted_by IS NULL);