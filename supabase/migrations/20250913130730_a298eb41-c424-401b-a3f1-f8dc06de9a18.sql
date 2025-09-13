-- ============================================================================
-- FINAL SECURITY FIXES - REMAINING CRITICAL ISSUES
-- ============================================================================

-- 1. CREATE SECURITY SUMMARY VIEW (for monitoring)
-- This helps track security status going forward
CREATE OR REPLACE VIEW public.security_audit_summary AS
SELECT 
  'RLS Status' as check_category,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN 'SECURE'
    ELSE 'CRITICAL: RLS DISABLED'
  END as security_status
FROM pg_tables 
JOIN pg_class ON pg_class.relname = pg_tables.tablename
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE schemaname = 'public'
  AND pg_namespace.nspname = 'public'
ORDER BY schemaname, tablename;

-- 2. ADD EXPLICIT DENY POLICIES FOR ULTRA SECURITY
-- These ensure that if our main policies fail, access is still denied

-- Deny all anonymous access to critical admin tables
CREATE POLICY "deny_anonymous_admin_actions" ON public.admin_actions_log
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_admin_audit" ON public.admin_audit_log
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_admin_logs" ON public.admin_logs
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_user_profiles" ON public.user_profiles
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_user_roles" ON public.user_roles
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_role_grants" ON public.role_grants
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_system_modules" ON public.system_modules
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_plugin_manifests" ON public.plugin_manifests
FOR ALL TO anon USING (false);

CREATE POLICY "deny_anonymous_performance_metrics" ON public.performance_metrics
FOR ALL TO anon USING (false);

-- 3. SECURE COMPANY INSURANCE TYPES TABLE
DROP POLICY IF EXISTS "Authenticated users view company insurance types" ON public.company_insurance_types;
CREATE POLICY "company_insurance_types_auth_read" ON public.company_insurance_types
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "company_insurance_types_admin_manage" ON public.company_insurance_types
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 4. SECURE USER FILTERS TABLES
CREATE POLICY "user_filters_admin_view" ON public.user_filters
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "user_lead_filters_admin_view" ON public.user_lead_filters
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- 5. SECURE USER SERVICE PREFERENCES
CREATE POLICY "user_service_preferences_admin_view" ON public.user_service_preferences
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role) OR
    auth.uid() = user_id
  )
);

-- 6. SECURE USER COMPANY ROLES
CREATE POLICY "user_company_roles_admin_manage" ON public.user_company_roles
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "user_company_roles_own_view" ON public.user_company_roles
FOR SELECT USING (auth.uid() = user_id);

-- 7. SECURE PLUGIN USER SETTINGS
CREATE POLICY "plugin_user_settings_admin_view" ON public.plugin_user_settings
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role) OR
    auth.uid() = user_id
  )
);

-- 8. SECURE PROPERTY TABLES - ONLY PROPERTY OWNERS CAN ACCESS
CREATE POLICY "properties_owner_only" ON public.properties
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "property_documents_owner_only" ON public.property_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_documents.property_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "property_expenses_owner_only" ON public.property_expenses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_expenses.property_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "property_transfers_participant_only" ON public.property_transfers
FOR SELECT USING (
  auth.uid() = from_user_id OR 
  auth.uid() = to_user_id OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role)
);

-- 9. SECURE TODO TABLE
CREATE POLICY "todos_owner_only" ON public.todos
FOR ALL USING (auth.uid() = user_id);

-- 10. CREATE COMPREHENSIVE SECURITY AUDIT FUNCTION
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS TABLE(
  category text,
  item text, 
  status text,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check RLS status for all public tables
  RETURN QUERY
  SELECT 
    'RLS Status'::text as category,
    schemaname || '.' || tablename as item,
    CASE 
      WHEN rowsecurity THEN 'ENABLED'
      ELSE 'DISABLED - CRITICAL'
    END as status,
    CASE 
      WHEN rowsecurity THEN 'Table has Row Level Security enabled'
      ELSE 'Table allows unrestricted access - SECURITY RISK'
    END as details
  FROM pg_tables 
  JOIN pg_class ON pg_class.relname = pg_tables.tablename
  JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
  WHERE schemaname = 'public'
    AND pg_namespace.nspname = 'public'
  ORDER BY schemaname, tablename;
END;
$$;

-- Grant execute to authenticated users so they can check security status
REVOKE ALL ON FUNCTION public.get_security_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_security_status() TO authenticated;

-- 11. ADD SECURITY MONITORING TRIGGER
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log security-sensitive operations
  INSERT INTO public.admin_actions_log (
    actor_user_id,
    target_kind,
    target_id,
    action,
    metadata
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add security monitoring to critical tables
DROP TRIGGER IF EXISTS security_audit_user_roles ON public.user_roles;
CREATE TRIGGER security_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

DROP TRIGGER IF EXISTS security_audit_role_grants ON public.role_grants;  
CREATE TRIGGER security_audit_role_grants
  AFTER INSERT OR UPDATE OR DELETE ON public.role_grants
  FOR EACH ROW EXECUTE FUNCTION public.log_security_event();