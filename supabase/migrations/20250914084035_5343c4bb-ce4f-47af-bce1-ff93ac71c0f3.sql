-- Fix critical security: Replace anonymous access policies with proper authentication
-- This addresses 87 security warnings from the linter

-- Fix admin_actions_log policy
DROP POLICY IF EXISTS "Only authenticated admins can view audit log" ON public.admin_actions_log;
DROP POLICY IF EXISTS "admin_actions_log_admin_only" ON public.admin_actions_log;

CREATE POLICY "admin_actions_log_authenticated_admin_only" 
ON public.admin_actions_log 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
);

-- Fix admin_audit_log policy  
DROP POLICY IF EXISTS "Only authenticated master_admin can access audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_master_admin_only" ON public.admin_audit_log;

CREATE POLICY "admin_audit_log_authenticated_master_admin_only"
ON public.admin_audit_log
FOR ALL
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'master_admin'
  )
);