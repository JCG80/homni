-- Fix RLS policies for user_profiles to enable proper test user functionality
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile extended" ON public.user_profiles;

-- Create proper INSERT policy for profiles
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create proper UPDATE policy for profiles (single policy)
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);