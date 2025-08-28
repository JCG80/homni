-- Fix Anonymous Access Policies - Corrected version
-- Remove anonymous access from protected tables and keep only necessary public access

-- Admin logs should be admin-only (using correct admin_id column)
DROP POLICY IF EXISTS "Authenticated admins can manage admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins only can manage admin logs" ON public.admin_logs;
CREATE POLICY "Admins only can manage admin logs" ON public.admin_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'master_admin')
  )
);

-- Buyer accounts should be authenticated only (buyer_accounts has no user_id, only admin access)
DROP POLICY IF EXISTS "Authenticated admins manage buyer accounts" ON public.buyer_accounts;
DROP POLICY IF EXISTS "Authenticated buyers view own account" ON public.buyer_accounts;
DROP POLICY IF EXISTS "Admins manage buyer accounts" ON public.buyer_accounts;
DROP POLICY IF EXISTS "Buyers view own account" ON public.buyer_accounts;
CREATE POLICY "Admin only buyer accounts" ON public.buyer_accounts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'master_admin')
  )
);

-- Fix company profiles - remove public access
DROP POLICY IF EXISTS "Authenticated users can view company profiles" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can view company profiles" ON public.company_profiles;
CREATE POLICY "Auth users view company profiles" ON public.company_profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix feature flags - remove anonymous access
DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Users can view feature flags" ON public.feature_flags;
CREATE POLICY "Auth users view feature flags" ON public.feature_flags
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix user profiles - remove anonymous access  
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view user profiles" ON public.user_profiles;
CREATE POLICY "Auth users view user profiles" ON public.user_profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix leads table - keep anonymous submit but remove anonymous read (using correct submitted_by column)
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anonymous can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view assigned leads" ON public.leads;
CREATE POLICY "Anonymous can create leads only" ON public.leads
FOR INSERT WITH CHECK (true); -- Allow anonymous lead creation

CREATE POLICY "Auth users view relevant leads" ON public.leads
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('admin', 'master_admin', 'company')
    )
  )
);

-- Fix module metadata - should be auth only
DROP POLICY IF EXISTS "Anyone can view module metadata" ON public.module_metadata;
DROP POLICY IF EXISTS "Users can view module metadata" ON public.module_metadata;
CREATE POLICY "Auth users view module metadata" ON public.module_metadata
FOR SELECT USING (auth.uid() IS NOT NULL);