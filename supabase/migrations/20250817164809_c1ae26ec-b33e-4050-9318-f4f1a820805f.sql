-- Fix critical database security policies
-- Remove anonymous access from admin and sensitive tables

-- 1. Fix admin_logs table - remove anonymous access
DROP POLICY IF EXISTS "Admins can manage admin logs" ON public.admin_logs;
CREATE POLICY "Authenticated admins can manage admin logs" 
ON public.admin_logs 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- 2. Fix module_access table - remove anonymous access  
DROP POLICY IF EXISTS "Admin users can manage module access" ON public.module_access;
CREATE POLICY "Authenticated admins can manage module access"
ON public.module_access 
FOR ALL 
TO authenticated
USING (EXISTS ( 
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.id = auth.uid() 
  AND ((user_profiles.metadata ->> 'role'::text) = 'admin'::text 
       OR (user_profiles.metadata ->> 'role'::text) = 'master_admin'::text)
));

DROP POLICY IF EXISTS "Users can view their own module access" ON public.module_access;
CREATE POLICY "Authenticated users can view their own module access"
ON public.module_access 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 3. Fix lead_settings table - restrict to authenticated only
DROP POLICY IF EXISTS "select_lead_settings" ON public.lead_settings;
CREATE POLICY "Authenticated can view lead settings"
ON public.lead_settings 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Fix company_profiles - restrict anonymous access for sensitive operations
DROP POLICY IF EXISTS "Anyone can view company profiles" ON public.company_profiles;
CREATE POLICY "Authenticated can view company profiles"
ON public.company_profiles 
FOR SELECT 
TO authenticated
USING (true);

-- 5. Fix system_modules - restrict to authenticated users only
DROP POLICY IF EXISTS "Admin users can manage system modules" ON public.system_modules;
CREATE POLICY "Authenticated admins can manage system modules"
ON public.system_modules 
FOR ALL 
TO authenticated
USING (EXISTS ( 
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.id = auth.uid() 
  AND ((user_profiles.metadata ->> 'role'::text) = 'admin'::text 
       OR (user_profiles.metadata ->> 'role'::text) = 'master_admin'::text)
));

-- Add read access for authenticated users to view available modules
CREATE POLICY "Authenticated users can view system modules"
ON public.system_modules 
FOR SELECT 
TO authenticated
USING (is_active = true);