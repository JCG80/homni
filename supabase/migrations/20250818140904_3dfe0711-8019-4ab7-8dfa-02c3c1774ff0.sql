-- Allow test users to insert/update their own profiles
-- This is needed for development quick login to work

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow test users to insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow test users to update profiles" ON public.user_profiles;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile  
CREATE POLICY "Users can update own profile extended"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);