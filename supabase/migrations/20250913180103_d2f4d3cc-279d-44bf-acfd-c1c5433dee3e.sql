-- Step 1: Drop ALL existing policies on user_profiles
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.user_profiles;';
    END LOOP;
END $$;

-- Step 2: Create a security definer function for role checking (non-recursive)
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS TEXT 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 3: Create safe, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "user_profiles_select_own" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "user_profiles_update_own" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "user_profiles_insert_own" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow system/service role to manage profiles (for triggers)
CREATE POLICY "user_profiles_system_manage" 
ON public.user_profiles FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');