-- Critical FORCE RLS fixes and policy cleanup
-- Phase 1: Enable FORCE RLS on leads table and clean up anonymous policies

-- STEP 1: Enable FORCE RLS on leads table (critical missing security)
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;

-- STEP 2: Clean up anonymous access policies on sensitive tables
-- Remove any policies that allow anonymous access to sensitive data

-- Clean up admin_actions_log - remove anonymous access
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.admin_actions_log;
DROP POLICY IF EXISTS "Deny anonymous access to admin_actions_log" ON public.admin_actions_log;

-- Clean up payment_records - remove anonymous access  
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.payment_records;
DROP POLICY IF EXISTS "Deny anonymous access to payment_records" ON public.payment_records;

-- Clean up error_tracking - remove anonymous access
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.error_tracking;
DROP POLICY IF EXISTS "Deny anonymous access to error_tracking" ON public.error_tracking;

-- STEP 3: Standardize admin policies using is_admin() function
-- Ensure consistent admin access patterns across sensitive tables

-- Update admin_actions_log admin policy
DROP POLICY IF EXISTS "Admin log secure access" ON public.admin_actions_log;
CREATE POLICY "Admins can view all admin actions" 
ON public.admin_actions_log
FOR SELECT 
USING (is_admin());

-- Update payment_records admin policy  
DROP POLICY IF EXISTS "Admins read all payments" ON public.payment_records;
CREATE POLICY "Admins can view all payments"
ON public.payment_records
FOR SELECT
USING (is_admin());

-- Update leads admin policies
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads;
CREATE POLICY "Admins can view all leads"
ON public.leads  
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all leads"
ON public.leads
FOR UPDATE  
USING (is_admin());

-- STEP 4: Ensure FORCE RLS is enabled on all other sensitive tables
ALTER TABLE public.admin_actions_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records FORCE ROW LEVEL SECURITY; 
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.todos FORCE ROW LEVEL SECURITY;
ALTER TABLE public.properties FORCE ROW LEVEL SECURITY;
ALTER TABLE public.documents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.role_grants FORCE ROW LEVEL SECURITY;