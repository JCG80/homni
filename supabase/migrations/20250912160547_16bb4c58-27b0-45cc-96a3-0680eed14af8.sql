-- Fix Critical Security Issues
-- 1. Convert SECURITY DEFINER view to SECURITY INVOKER
DROP VIEW IF EXISTS public.maintenance_export_v;

CREATE VIEW public.maintenance_export_v 
WITH (security_invoker = true) AS
SELECT 
  maintenance_tasks.version,
  jsonb_agg(jsonb_build_object(
    'id', maintenance_tasks.id, 
    'title', maintenance_tasks.title, 
    'description', maintenance_tasks.description, 
    'seasons', maintenance_tasks.seasons, 
    'property_types', maintenance_tasks.property_types, 
    'frequency_months', maintenance_tasks.frequency_months, 
    'priority', maintenance_tasks.priority, 
    'estimated_time', maintenance_tasks.estimated_time, 
    'cost_estimate', maintenance_tasks.cost_estimate
  ) ORDER BY maintenance_tasks.title) AS tasks
FROM maintenance_tasks
GROUP BY maintenance_tasks.version;

-- 2. Fix functions without proper search_path
-- Update all SECURITY DEFINER functions to have proper search_path = public

-- Fix get_auth_user_role function
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix get_user_role function  
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix is_internal_admin function
CREATE OR REPLACE FUNCTION public.is_internal_admin(check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = COALESCE(check_user_id, auth.uid())
    AND role = 'master_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix check_admin_role function
CREATE OR REPLACE FUNCTION public.check_admin_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;