-- COMPREHENSIVE ROLE SYSTEM UPGRADE - FINAL VERSION
-- Complete role system implementation with corrected indexing

-- STEP 0: Logging and validation
CREATE TABLE IF NOT EXISTS public._migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN,
    error_message TEXT
);

BEGIN;
INSERT INTO public._migration_log (migration_name, executed_at, success)
VALUES ('comprehensive_role_system_final', NOW(), true);

-- STEP 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- STEP 2: Drop existing conflicting functions first
DROP FUNCTION IF EXISTS public.grant_role(UUID, app_role, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.grant_role(UUID, app_role, TEXT);
DROP FUNCTION IF EXISTS public.revoke_role(UUID, app_role, TEXT);
DROP FUNCTION IF EXISTS public.revoke_role(UUID, app_role);

-- STEP 3: Update app_role enum (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin');
    END IF;
END $$;

-- STEP 4: Enhance user_roles table structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- Ensure FORCE RLS is enabled
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
END $$;

-- STEP 5: Ensure critical tables have FORCE RLS
DO $$
BEGIN
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
END $$;

-- STEP 6: Enhanced role management functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND COALESCE(is_active, true) = true
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(
    CASE 
      WHEN role = 'master_admin' THEN 100
      WHEN role = 'admin' THEN 80
      WHEN role = 'content_editor' THEN 60
      WHEN role = 'company' THEN 40
      WHEN role = 'user' THEN 20
      WHEN role = 'guest' THEN 0
      ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id
    AND COALESCE(is_active, true) = true
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level;
$$;

CREATE OR REPLACE FUNCTION public.grant_user_role(_user_id UUID, _role app_role, _expires_at TIMESTAMPTZ DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to grant roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by, granted_at, expires_at, is_active)
  VALUES (_user_id, _role, auth.uid(), NOW(), _expires_at, true)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET
    granted_by = auth.uid(),
    granted_at = NOW(),
    expires_at = _expires_at,
    is_active = true,
    revoked_at = NULL,
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_role(_user_id UUID, _role app_role)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to revoke roles';
  END IF;

  UPDATE public.user_roles
  SET is_active = false,
      revoked_at = NOW(),
      updated_at = NOW()
  WHERE user_id = _user_id
    AND role = _role
    AND revoked_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_roles()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE public.user_roles 
    SET is_active = false, 
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE expires_at < NOW() 
      AND COALESCE(is_active, true) = true 
      AND revoked_at IS NULL;
      
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

-- STEP 7: Clear existing conflicting policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_roles';
    END LOOP;
    
    -- Drop conflicting policies on other tables
    DROP POLICY IF EXISTS "Users read own payments" ON public.payment_records;
    DROP POLICY IF EXISTS "Admins can view all payments" ON public.payment_records;
    DROP POLICY IF EXISTS "Admins can insert payments" ON public.payment_records;
    DROP POLICY IF EXISTS "Admins can update payments" ON public.payment_records;
    DROP POLICY IF EXISTS "Users can insert own payments" ON public.payment_records;
    DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payment_records;
    
    DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "Admins can update admin actions" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "System can insert admin actions" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "Admins can manage admin actions" ON public.admin_actions_log;
END $$;

-- STEP 8: Comprehensive RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 9: Enhanced payment_records policies
CREATE POLICY "Users can view own payments"
ON public.payment_records FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
ON public.payment_records FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Users can insert own payments"
ON public.payment_records FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert any payments"
ON public.payment_records FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Users can update own payments"
ON public.payment_records FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update any payments"
ON public.payment_records FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can delete any payments"
ON public.payment_records FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 10: Enhanced admin_actions_log policies  
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "System can insert admin actions"
ON public.admin_actions_log FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update admin actions"
ON public.admin_actions_log FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can delete admin actions"
ON public.admin_actions_log FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 11: Migrate existing role data
DO $$
DECLARE
    profile_record RECORD;
    role_enum app_role;
    migration_count INTEGER := 0;
BEGIN
    FOR profile_record IN 
        SELECT user_id, role, created_at 
        FROM public.user_profiles 
        WHERE role IS NOT NULL AND role != 'guest' AND user_id IS NOT NULL
    LOOP
        BEGIN
            role_enum := profile_record.role::app_role;
            INSERT INTO public.user_roles (user_id, role, granted_at, granted_by, is_active)
            VALUES (profile_record.user_id, role_enum, COALESCE(profile_record.created_at, NOW()), profile_record.user_id, true)
            ON CONFLICT (user_id, role) DO NOTHING;
            migration_count := migration_count + 1;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public._migration_log (migration_name, executed_at, success, error_message)
            VALUES ('role_migration_item', NOW(), false, 'Failed: ' || profile_record.role || ' for user: ' || profile_record.user_id);
        END;
    END LOOP;
    
    INSERT INTO public._migration_log (migration_name, executed_at, success, error_message)
    VALUES ('role_migration_completed', NOW(), true, 'Migrated ' || migration_count || ' records');
END $$;

-- STEP 12: Create performance indexes (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_active 
ON public.user_roles (user_id) WHERE COALESCE(is_active, true) = true AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_role_active 
ON public.user_roles (role) WHERE COALESCE(is_active, true) = true AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at 
ON public.user_roles (expires_at) WHERE expires_at IS NOT NULL AND COALESCE(is_active, true) = true;

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_actor ON public.admin_actions_log (actor_user_id);

-- STEP 13: Setup automated cleanup with pg_cron
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-roles-nightly') THEN
        PERFORM cron.schedule(
            'cleanup-expired-roles-nightly',
            '0 2 * * *',
            'SELECT public.cleanup_expired_roles();'
        );
    END IF;
END $$;

-- STEP 14: Final completion
INSERT INTO public._migration_log (migration_name, executed_at, success)
VALUES ('comprehensive_role_system_success', NOW(), true);

COMMIT;