-- Continue security hardening: Fix more critical admin table policies
-- Focus on tables with sensitive admin/system data

-- 1. Fix user_profiles - should deny anonymous access to user data
CREATE POLICY "Deny anonymous access to user_profiles"
ON public.user_profiles 
FOR ALL 
TO anon
USING (false);

-- 2. Fix user_roles - should deny anonymous access to role management
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles 
FOR ALL 
TO anon
USING (false);

-- 3. Fix role_grants - should deny anonymous access to role grants
CREATE POLICY "Deny anonymous access to role_grants"
ON public.role_grants 
FOR ALL 
TO anon
USING (false);

-- 4. Fix user_modules - should deny anonymous access to module management
CREATE POLICY "Deny anonymous access to user_modules"
ON public.user_modules 
FOR ALL 
TO anon
USING (false);

-- 5. Fix system_modules - should deny anonymous access to system configuration
CREATE POLICY "Deny anonymous access to system_modules"
ON public.system_modules 
FOR ALL 
TO anon
USING (false);

-- 6. Fix feature_flags - should deny anonymous access to feature configuration
CREATE POLICY "Deny anonymous access to feature_flags"
ON public.feature_flags 
FOR ALL 
TO anon
USING (false);

-- 7. Fix company_profiles - should deny anonymous access to company data
CREATE POLICY "Deny anonymous access to company_profiles"
ON public.company_profiles 
FOR ALL 
TO anon
USING (false);

-- 8. Fix leads table - should only allow authenticated users to create/view leads
CREATE POLICY "Deny anonymous access to leads management"
ON public.leads 
FOR SELECT, UPDATE, DELETE
TO anon
USING (false);

-- 9. Fix todos - should deny anonymous access to user todos
CREATE POLICY "Deny anonymous access to todos"
ON public.todos 
FOR ALL 
TO anon
USING (false);

-- 10. Fix user_activity_summaries - should deny anonymous access to analytics
CREATE POLICY "Deny anonymous access to user_activity_summaries"
ON public.user_activity_summaries 
FOR ALL 
TO anon
USING (false);