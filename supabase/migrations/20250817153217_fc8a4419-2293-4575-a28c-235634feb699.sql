-- Fix critical RLS gaps across key tables

-- 1) Admin logs: only admins/master_admins can access
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin logs"
ON public.admin_logs
FOR ALL
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

-- 2) Module dependencies: authenticated can read, only admins can modify
ALTER TABLE public.module_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_dependencies FORCE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage module dependencies"
ON public.module_dependencies
FOR ALL
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Authenticated can view module dependencies"
ON public.module_dependencies
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3) Service modules: authenticated can read, only admins can modify
ALTER TABLE public.service_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_modules FORCE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage service modules"
ON public.service_modules
FOR ALL
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Authenticated can view service modules"
ON public.service_modules
FOR SELECT
USING (auth.role() = 'authenticated');

-- 4) User modules: users can view their own, admins can manage all
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modules FORCE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all user modules"
ON public.user_modules
FOR ALL
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Users can view their own module access"
ON public.user_modules
FOR SELECT
USING (auth.uid() = user_id);
