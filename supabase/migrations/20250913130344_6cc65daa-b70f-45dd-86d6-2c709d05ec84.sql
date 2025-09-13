-- ============================================================================
-- PHASE 2: FIX REMAINING ANONYMOUS ACCESS POLICIES
-- ============================================================================

-- 10. FIX COMPANY TABLES - Proper role-based access
DROP POLICY IF EXISTS "company_profiles_authenticated_only" ON public.company_profiles;
CREATE POLICY "company_profiles_admin_manage" ON public.company_profiles
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "company_profiles_own_company" ON public.company_profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

CREATE POLICY "company_profiles_own_update" ON public.company_profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. FIX USER TABLES - Remove anonymous access
DROP POLICY IF EXISTS "user_profiles_authenticated_only" ON public.user_profiles;
CREATE POLICY "user_profiles_admin_manage" ON public.user_profiles
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "user_profiles_own_view" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_own_update" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 12. FIX MODULE ACCESS TABLES
DROP POLICY IF EXISTS "user_modules_authenticated_only" ON public.user_modules;
CREATE POLICY "user_modules_admin_manage" ON public.user_modules
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "user_modules_own_view" ON public.user_modules
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "system_modules_authenticated_only" ON public.system_modules;
CREATE POLICY "system_modules_admin_manage" ON public.system_modules
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "system_modules_auth_read" ON public.system_modules
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 13. FIX PLUGIN TABLES
DROP POLICY IF EXISTS "plugin_manifests_authenticated_only" ON public.plugin_manifests;
CREATE POLICY "plugin_manifests_admin_only" ON public.plugin_manifests
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

DROP POLICY IF EXISTS "plugin_settings_authenticated_only" ON public.plugin_settings;
CREATE POLICY "plugin_settings_admin_only" ON public.plugin_settings
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 14. FIX ROLE TABLES
DROP POLICY IF EXISTS "role_grants_authenticated_only" ON public.role_grants;
CREATE POLICY "role_grants_admin_manage" ON public.role_grants
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "role_grants_own_view" ON public.role_grants
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_roles_authenticated_only" ON public.user_roles;
CREATE POLICY "user_roles_admin_manage" ON public.user_roles
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "user_roles_own_view" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- 15. FIX AUDIT TABLES  
DROP POLICY IF EXISTS "role_switch_audit_authenticated_only" ON public.role_switch_audit;
CREATE POLICY "role_switch_audit_admin_view" ON public.role_switch_audit
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "role_switch_audit_own_view" ON public.role_switch_audit
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "role_switch_audit_own_insert" ON public.role_switch_audit
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 16. FIX SERVICE TABLES
DROP POLICY IF EXISTS "service_modules_authenticated_only" ON public.service_modules;
CREATE POLICY "service_modules_admin_manage" ON public.service_modules
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "service_modules_auth_read" ON public.service_modules
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 17. FIX PROJECT DOCS
DROP POLICY IF EXISTS "project_docs_authenticated_only" ON public.project_docs;
CREATE POLICY "project_docs_admin_manage" ON public.project_docs
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "project_docs_auth_read" ON public.project_docs
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 18. FIX ACTIVITY SUMMARIES
DROP POLICY IF EXISTS "user_activity_authenticated_only" ON public.user_activity_summaries;
CREATE POLICY "user_activity_admin_view" ON public.user_activity_summaries
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "user_activity_own_view" ON public.user_activity_summaries
FOR SELECT USING (auth.uid() = user_id);

-- 19. FIX LEAD TABLES ACCESS CONTROL
DROP POLICY IF EXISTS "lead_assignments_authenticated_only" ON public.lead_assignments;
CREATE POLICY "lead_assignments_admin_manage" ON public.lead_assignments
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "lead_assignments_buyer_view" ON public.lead_assignments
FOR SELECT USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.company_id::text = buyer_id::text
  )
);

DROP POLICY IF EXISTS "lead_history_authenticated_only" ON public.lead_history;
CREATE POLICY "lead_history_admin_manage" ON public.lead_history
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "lead_history_company_view" ON public.lead_history
FOR SELECT USING (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.company_id = assigned_to
  )
);