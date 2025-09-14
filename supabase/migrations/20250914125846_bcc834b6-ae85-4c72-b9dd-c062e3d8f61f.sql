-- CRITICAL SECURITY FIX: Address anonymous access policies
-- Update all policies to explicitly deny anonymous access

-- Create a comprehensive auth check function
CREATE OR REPLACE FUNCTION public.is_authenticated_with_role(required_roles text[] DEFAULT ARRAY['authenticated'])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    auth.uid() IS NOT NULL 
    AND auth.role() = 'authenticated'::text
    AND (
      ARRAY['authenticated'] = required_roles 
      OR EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND up.role = ANY(required_roles)
      )
    );
$function$;

-- Fix the most critical admin policies first
-- These tables handle sensitive data and must be fully secured

-- Fix user_profiles policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_system_manage" ON public.user_profiles;

CREATE POLICY "user_profiles_select_own" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "user_profiles_update_own" 
ON public.user_profiles 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "user_profiles_admin_manage" 
ON public.user_profiles 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix todos policies (simple case)
DROP POLICY IF EXISTS "todos_select_own" ON public.todos;
DROP POLICY IF EXISTS "todos_update_own" ON public.todos;
DROP POLICY IF EXISTS "todos_delete_own" ON public.todos;
DROP POLICY IF EXISTS "todos_insert_own" ON public.todos;

CREATE POLICY "todos_select_own" 
ON public.todos 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "todos_insert_own" 
ON public.todos 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "todos_update_own" 
ON public.todos 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "todos_delete_own" 
ON public.todos 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

-- Fix analytics policies
DROP POLICY IF EXISTS "analytics_events_users_own" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_admin_manage" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_authenticated_users_only" ON public.analytics_events;

CREATE POLICY "analytics_events_users_own" 
ON public.analytics_events 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND user_id = auth.uid()
);

CREATE POLICY "analytics_events_admin_manage" 
ON public.analytics_events 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix performance_metrics policies
DROP POLICY IF EXISTS "performance_metrics_admin_only" ON public.performance_metrics;
DROP POLICY IF EXISTS "Only admins can access performance metrics" ON public.performance_metrics;

CREATE POLICY "performance_metrics_admin_only" 
ON public.performance_metrics 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Fix system_modules policies
DROP POLICY IF EXISTS "system_modules_auth_read" ON public.system_modules;
DROP POLICY IF EXISTS "system_modules_admin_manage" ON public.system_modules;

CREATE POLICY "system_modules_auth_read" 
ON public.system_modules 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "system_modules_admin_manage" 
ON public.system_modules 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  )
);

-- Create a deny-all policy for critical tables to block anonymous access
CREATE POLICY "deny_anonymous_access" 
ON public.admin_actions_log 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "deny_anonymous_access" 
ON public.admin_audit_log 
FOR ALL 
TO anon 
USING (false);

CREATE POLICY "deny_anonymous_access" 
ON public.error_tracking 
FOR ALL 
TO anon 
USING (false);

-- Add similar blocks for other sensitive tables