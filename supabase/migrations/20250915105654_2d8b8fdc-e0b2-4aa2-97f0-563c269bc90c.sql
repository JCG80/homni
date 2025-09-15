-- Fix RLS and database issues
-- Enable RLS on critical tables that might be missing it
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for anonymous/authenticated access
CREATE POLICY "Allow anonymous read access to user_profiles for auth" 
ON public.user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to read own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure proper policies for company profiles
CREATE POLICY "Allow authenticated users to read company profiles" 
ON public.company_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow company users to update own company profile" 
ON public.company_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);