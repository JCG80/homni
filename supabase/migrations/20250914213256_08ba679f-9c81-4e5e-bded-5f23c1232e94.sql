-- COMPREHENSIVE ROLE SYSTEM - CONFLICT-FREE FINAL VERSION
-- Handles all existing policies and creates complete role system

BEGIN;

-- STEP 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- STEP 2: Drop ALL existing conflicting functions
DROP FUNCTION IF EXISTS public.grant_role(UUID, app_role, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.grant_role(UUID, app_role, TEXT);
DROP FUNCTION IF EXISTS public.revoke_role(UUID, app_role, TEXT);
DROP FUNCTION IF EXISTS public.revoke_role(UUID, app_role);

-- STEP 3: Ensure app_role enum exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin');
    END IF;
END $$;

-- STEP 4: Enhance user_roles table
DO $$
BEGIN
    ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
    
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
END $$;

-- STEP 5: Enable FORCE RLS on critical tables
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.admin_actions_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.error_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_tracking FORCE ROW LEVEL SECURITY;

-- STEP 6: Create enhanced role functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role 
      AND COALESCE(is_active, true) = true AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID)
RETURNS INTEGER LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(MAX(
    CASE role
      WHEN 'master_admin' THEN 100 WHEN 'admin' THEN 80 WHEN 'content_editor' THEN 60
      WHEN 'company' THEN 40 WHEN 'user' THEN 20 WHEN 'guest' THEN 0 ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id AND COALESCE(is_active, true) = true 
    AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW());
$$;

CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.get_user_role_level(_user_id) >= _min_level; $$;

CREATE OR REPLACE FUNCTION public.grant_user_role(_user_id UUID, _role app_role, _expires_at TIMESTAMPTZ DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to grant roles';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role, granted_by, granted_at, expires_at, is_active)
  VALUES (_user_id, _role, auth.uid(), NOW(), _expires_at, true)
  ON CONFLICT (user_id, role) DO UPDATE SET
    granted_by = auth.uid(), granted_at = NOW(), expires_at = _expires_at,
    is_active = true, revoked_at = NULL, updated_at = NOW();
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_user_role(_user_id UUID, _role app_role)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to revoke roles';
  END IF;
  
  UPDATE public.user_roles SET is_active = false, revoked_at = NOW(), updated_at = NOW()
  WHERE user_id = _user_id AND role = _role AND revoked_at IS NULL;
END; $$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_roles()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE affected_count INTEGER;
BEGIN
    UPDATE public.user_roles SET is_active = false, revoked_at = NOW(), updated_at = NOW()
    WHERE expires_at < NOW() AND COALESCE(is_active, true) = true AND revoked_at IS NULL;
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END; $$;

-- STEP 7: Drop ALL existing policies systematically
DO $$
DECLARE policy_rec RECORD;
BEGIN
    -- Drop all policies on all target tables
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename IN ('user_roles', 'payment_records', 'admin_actions_log')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_rec.policyname, policy_rec.schemaname, policy_rec.tablename);
    END LOOP;
END $$;

-- STEP 8: Create comprehensive RLS policies (user_roles)
CREATE POLICY "usr_view_own_roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "adm_view_all_roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "adm_insert_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "adm_update_roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "adm_delete_roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 9: Create comprehensive RLS policies (payment_records)  
CREATE POLICY "usr_view_own_payments" ON public.payment_records FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "adm_view_all_payments" ON public.payment_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "usr_insert_own_payments" ON public.payment_records FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "adm_insert_any_payments" ON public.payment_records FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "usr_update_own_payments" ON public.payment_records FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "adm_update_any_payments" ON public.payment_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "adm_delete_any_payments" ON public.payment_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 10: Create comprehensive RLS policies (admin_actions_log)
CREATE POLICY "adm_view_all_admin_actions" ON public.admin_actions_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "sys_insert_admin_actions" ON public.admin_actions_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "adm_update_admin_actions" ON public.admin_actions_log FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));
CREATE POLICY "adm_delete_admin_actions" ON public.admin_actions_log FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 11: Migrate existing data safely
DO $$
DECLARE rec RECORD; cnt INTEGER := 0;
BEGIN
    FOR rec IN SELECT user_id, role, created_at FROM public.user_profiles WHERE role IS NOT NULL AND role != 'guest' AND user_id IS NOT NULL
    LOOP
        BEGIN
            INSERT INTO public.user_roles (user_id, role, granted_at, granted_by, is_active)
            VALUES (rec.user_id, rec.role::app_role, COALESCE(rec.created_at, NOW()), rec.user_id, true)
            ON CONFLICT (user_id, role) DO NOTHING;
            cnt := cnt + 1;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END $$;

-- STEP 12: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles (user_id) WHERE COALESCE(is_active, true) = true AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_by_role ON public.user_roles (role) WHERE COALESCE(is_active, true) = true AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_expiry ON public.user_roles (expires_at) WHERE expires_at IS NOT NULL AND COALESCE(is_active, true) = true;
CREATE INDEX IF NOT EXISTS idx_payment_records_uid ON public.payment_records (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_actor ON public.admin_actions_log (actor_user_id);

-- STEP 13: Setup pg_cron automation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-roles-nightly') THEN
        PERFORM cron.schedule('cleanup-expired-roles-nightly', '0 2 * * *', 'SELECT public.cleanup_expired_roles();');
    END IF;
END $$;

COMMIT;