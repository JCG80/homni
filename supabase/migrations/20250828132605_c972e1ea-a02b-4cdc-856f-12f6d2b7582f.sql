-- Fix Anonymous Access Policies
-- Remove anonymous access from protected tables and keep only necessary public access

-- Admin logs should be admin-only
DROP POLICY IF EXISTS "Authenticated admins can manage admin logs" ON public.admin_logs;
CREATE POLICY "Admins only can manage admin logs" ON public.admin_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'master_admin')
  )
);

-- Buyer accounts should be authenticated only
DROP POLICY IF EXISTS "Authenticated admins manage buyer accounts" ON public.buyer_accounts;
DROP POLICY IF EXISTS "Authenticated buyers view own account" ON public.buyer_accounts;
CREATE POLICY "Admins manage buyer accounts" ON public.buyer_accounts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('admin', 'master_admin')
  )
);
CREATE POLICY "Buyers view own account" ON public.buyer_accounts
FOR SELECT USING (auth.uid() = user_id);

-- Fix company profiles - remove public access except for reviews context
DROP POLICY IF EXISTS "Authenticated users can view company profiles" ON public.company_profiles;
CREATE POLICY "Users can view company profiles" ON public.company_profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix feature flags - remove anonymous access
DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON public.feature_flags;
CREATE POLICY "Users can view feature flags" ON public.feature_flags
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix user profiles - remove anonymous access  
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON public.user_profiles;
CREATE POLICY "Users can view user profiles" ON public.user_profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix leads table - keep anonymous submit but remove anonymous read
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anonymous can create leads" ON public.leads
FOR INSERT WITH CHECK (true); -- Allow anonymous lead creation only

CREATE POLICY "Users can view assigned leads" ON public.leads
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('admin', 'master_admin', 'company')
    )
  )
);

-- Keep public content readable but ensure everything else requires auth
-- Content should be readable by everyone for public pages
-- (This is expected and secure)

-- Keep insurance companies and detached buildings public for selection purposes
-- (This is expected and secure for reference data)

-- Fix module metadata - should be auth only
DROP POLICY IF EXISTS "Anyone can view module metadata" ON public.module_metadata;
CREATE POLICY "Users can view module metadata" ON public.module_metadata
FOR SELECT USING (auth.uid() IS NOT NULL);