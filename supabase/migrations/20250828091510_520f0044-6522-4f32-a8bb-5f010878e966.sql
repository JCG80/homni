-- Security hardening: Fix RLS policies to prevent anonymous access where inappropriate
-- This addresses the 42 security warnings from the linter

-- 1. Admin-only tables: Restrict to authenticated admin users only
DROP POLICY IF EXISTS "Authenticated admins can manage admin logs" ON public.admin_logs;
CREATE POLICY "Authenticated admins can manage admin logs" 
ON public.admin_logs 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- 2. Buyer management tables: Restrict to authenticated users
DROP POLICY IF EXISTS "Admins manage buyer accounts" ON public.buyer_accounts;
DROP POLICY IF EXISTS "Buyers view own account" ON public.buyer_accounts;
CREATE POLICY "Authenticated admins manage buyer accounts" 
ON public.buyer_accounts 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Authenticated buyers view own account" 
ON public.buyer_accounts 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.id = auth.uid() 
  AND up.company_id::text = buyer_accounts.id::text
));

-- 3. Company profiles: Restrict authenticated access except for public company info
DROP POLICY IF EXISTS "Authenticated can view company profiles" ON public.company_profiles;
CREATE POLICY "Authenticated users can view company profiles" 
ON public.company_profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Anonymous users cannot view company profiles
CREATE POLICY "Block anonymous access to company profiles" 
ON public.company_profiles 
FOR ALL 
TO anon
USING (false);

-- 4. User profiles: Strictly authenticated only
DROP POLICY IF EXISTS "user_profiles_admin_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
CREATE POLICY "Authenticated admins select all user profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]));

CREATE POLICY "Authenticated users select own profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Block anonymous access to user profiles
CREATE POLICY "Block anonymous access to user profiles" 
ON public.user_profiles 
FOR ALL 
TO anon
USING (false);

-- 5. Feature flags: Restrict to authenticated users only
DROP POLICY IF EXISTS "Feature flags viewable by authenticated" ON public.feature_flags;
CREATE POLICY "Authenticated users can view feature flags" 
ON public.feature_flags 
FOR SELECT 
TO authenticated
USING (true);

-- Block anonymous access to feature flags
CREATE POLICY "Block anonymous access to feature flags" 
ON public.feature_flags 
FOR ALL 
TO anon
USING (false);

-- 6. Content: Keep published content public but restrict admin operations
DROP POLICY IF EXISTS "Admins and editors manage content" ON public.content;
CREATE POLICY "Authenticated admins and editors manage content" 
ON public.content 
FOR ALL 
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text, 'content_editor'::text]))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text, 'content_editor'::text]));

-- 7. Lead assignments: Restrict to authenticated users
DROP POLICY IF EXISTS "Admins manage assignments" ON public.lead_assignments;
DROP POLICY IF EXISTS "Buyers view assigned leads" ON public.lead_assignments;
CREATE POLICY "Authenticated admins manage assignments" 
ON public.lead_assignments 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Authenticated buyers view assigned leads" 
ON public.lead_assignments 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.id = auth.uid() 
  AND up.company_id::text = lead_assignments.buyer_id::text
));

-- Block anonymous access to lead assignments
CREATE POLICY "Block anonymous access to lead assignments" 
ON public.lead_assignments 
FOR ALL 
TO anon
USING (false);

-- 8. System modules: Restrict to authenticated users
DROP POLICY IF EXISTS "Authenticated users can view system modules" ON public.system_modules;
CREATE POLICY "Authenticated users can view active system modules" 
ON public.system_modules 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Block anonymous access to system modules
CREATE POLICY "Block anonymous access to system modules" 
ON public.system_modules 
FOR ALL 
TO anon
USING (false);

-- 9. Leads: Maintain anonymous lead creation but restrict other operations
-- Keep existing anon insert policy but ensure other operations are authenticated
DROP POLICY IF EXISTS "Users can view their attributed leads" ON public.leads;
CREATE POLICY "Authenticated users can view their attributed leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = submitted_by 
  OR (
    anonymous_email IS NOT NULL 
    AND NULLIF(((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text), ''::text) IS NOT NULL 
    AND lower(((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)) = lower(anonymous_email)
  )
);

-- 10. Module metadata: Restrict to authenticated users
DROP POLICY IF EXISTS "Module metadata viewable by authenticated" ON public.module_metadata;
CREATE POLICY "Authenticated users can view module metadata" 
ON public.module_metadata 
FOR SELECT 
TO authenticated
USING (true);

-- Block anonymous access to module metadata
CREATE POLICY "Block anonymous access to module metadata" 
ON public.module_metadata 
FOR ALL 
TO anon
USING (false);

-- Add comprehensive anonymous blocks for remaining sensitive tables
CREATE POLICY "Block anonymous access to buyer_spend_ledger" ON public.buyer_spend_ledger FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to buyer_package_subscriptions" ON public.buyer_package_subscriptions FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to lead_assignment_history" ON public.lead_assignment_history FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to lead_settings" ON public.lead_settings FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to role_switch_audit" ON public.role_switch_audit FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to user_roles" ON public.user_roles FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to user_modules" ON public.user_modules FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to plugin_manifests" ON public.plugin_manifests FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to plugin_settings" ON public.plugin_settings FOR ALL TO anon USING (false);
CREATE POLICY "Block anonymous access to plugin_user_settings" ON public.plugin_user_settings FOR ALL TO anon USING (false);

-- Ensure public viewing policies remain for intentionally public data
-- (insurance_companies, insurance_types, company_insurance_types, company_reviews viewing, published content)
-- These already have appropriate public SELECT policies