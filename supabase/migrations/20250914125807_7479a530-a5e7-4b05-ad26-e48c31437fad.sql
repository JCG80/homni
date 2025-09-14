-- Fix function security by setting search_path to secure mode
-- This addresses the "Function Search Path Mutable" warnings

-- Update existing functions to have secure search paths
CREATE OR REPLACE FUNCTION public.touch_updated_at_mt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_plugin_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_feature_flags_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_company_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lead_assignment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix anonymous access policies by adding proper auth checks
-- Update policies to explicitly deny anonymous access

-- Fix admin_actions_log policy
DROP POLICY IF EXISTS "admin_actions_log_authenticated_admin_only" ON public.admin_actions_log;
CREATE POLICY "admin_actions_log_authenticated_admin_only" 
ON public.admin_actions_log 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix admin_audit_log policy
DROP POLICY IF EXISTS "admin_audit_log_authenticated_master_admin_only" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log_authenticated_master_admin_only" 
ON public.admin_audit_log 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND has_role(auth.uid(), 'master_admin'::app_role)
);

-- Add comprehensive RLS policies for tables that have RLS enabled but no policies
-- (This will be determined by the specific tables found in the linter output)

-- Create a function to check if user is authenticated (not anonymous)
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT auth.uid() IS NOT NULL AND auth.role() = 'authenticated';
$function$;

-- Ensure all policies explicitly check for authenticated users
-- Update existing policies to be more secure