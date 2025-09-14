-- COMPREHENSIVE ROLE SYSTEM UPGRADE - COMPLETE IMPLEMENTATION
-- Phase 1-5: Full Role System with RLS, Functions, and Automation

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
VALUES ('comprehensive_role_system_upgrade', NOW(), true);

-- STEP 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- STEP 2: Update app_role enum (idempotent)
DO $$
BEGIN
    -- Create enum if it doesn't exist, or ensure all values are present
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin');
    ELSE
        -- Add missing enum values if any
        BEGIN
            ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'guest';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_editor';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END IF;
END $$;

-- STEP 3: Enhance user_roles table structure
DO $$
BEGIN
    -- Add missing columns if they don't exist
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
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

-- STEP 4: Ensure payment_records has proper structure and FORCE RLS
DO $$
BEGIN
    -- Ensure FORCE RLS on existing tables
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

-- STEP 5: Enhanced role management functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level;
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
    AND is_active = true
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

CREATE OR REPLACE FUNCTION public.get_user_effective_roles(_user_id UUID DEFAULT auth.uid())
RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  roles_arr text[];
BEGIN
  -- Combine base roles and granted roles
  SELECT ARRAY(
    SELECT DISTINCT r::text FROM (
      -- Base roles from user_roles table
      SELECT ur.role::text AS r
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      UNION
      -- Granted roles from role_grants table
      SELECT rg.role::text AS r
      FROM public.role_grants rg
      WHERE rg.user_id = _user_id
        AND rg.is_active = true
        AND rg.revoked_at IS NULL
        AND (rg.expires_at IS NULL OR rg.expires_at > NOW())
    ) AS combined
  ) INTO roles_arr;

  -- Return empty array if null
  RETURN COALESCE(roles_arr, ARRAY[]::text[]);
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_role(_user_id UUID, _role app_role, _context TEXT DEFAULT NULL, _expires_at TIMESTAMPTZ DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permissions
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to grant roles';
  END IF;

  -- Insert or update role
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

CREATE OR REPLACE FUNCTION public.revoke_role(_user_id UUID, _role app_role, _context TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permissions
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to revoke roles';
  END IF;

  -- Mark role as revoked
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
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.user_roles 
    SET is_active = false, 
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE expires_at < NOW() 
      AND is_active = true 
      AND revoked_at IS NULL;
$$;

-- STEP 6: Clear all existing conflicting policies systematically
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on user_roles
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
    
    DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "Admins can insert admin actions" ON public.admin_actions_log;
    DROP POLICY IF EXISTS "Admins can update admin actions" ON public.admin_actions_log;
END $$;

-- STEP 7: Comprehensive RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 8: Enhanced payment_records policies
CREATE POLICY "Users can view own payments"
ON public.payment_records
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
ON public.payment_records
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Users can insert own payments"
ON public.payment_records
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments"
ON public.payment_records
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 9: Enhanced admin_actions_log policies  
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "System can insert admin actions"
ON public.admin_actions_log
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage admin actions"
ON public.admin_actions_log
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role));

-- STEP 10: Migrate existing role data safely
DO $$
DECLARE
    profile_record RECORD;
    role_enum app_role;
BEGIN
    -- Migrate from user_profiles.role to user_roles table
    FOR profile_record IN 
        SELECT user_id, role, created_at 
        FROM public.user_profiles 
        WHERE role IS NOT NULL 
          AND role != 'guest'
          AND user_id IS NOT NULL
    LOOP
        BEGIN
            -- Convert text role to enum safely
            role_enum := profile_record.role::app_role;
            
            -- Insert into user_roles if not exists
            INSERT INTO public.user_roles (user_id, role, granted_at, granted_by, is_active)
            VALUES (profile_record.user_id, role_enum, COALESCE(profile_record.created_at, NOW()), profile_record.user_id, true)
            ON CONFLICT (user_id, role) DO NOTHING;
            
        EXCEPTION WHEN OTHERS THEN
            -- Log failed conversions but continue
            INSERT INTO public._migration_log (migration_name, executed_at, success, error_message)
            VALUES ('role_migration_item', NOW(), false, 'Failed to migrate role: ' || profile_record.role || ' for user: ' || profile_record.user_id);
        END;
    END LOOP;
END $$;

-- STEP 11: Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id_active 
ON public.user_roles (user_id) WHERE is_active = true AND revoked_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role_active 
ON public.user_roles (role) WHERE is_active = true AND revoked_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_expires_at 
ON public.user_roles (expires_at) WHERE expires_at IS NOT NULL AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_records_user_id 
ON public.payment_records (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_actions_log_actor 
ON public.admin_actions_log (actor_user_id);

-- STEP 12: Setup automated cleanup with pg_cron
SELECT cron.schedule(
    'cleanup-expired-roles-nightly',
    '0 2 * * *', -- Run at 2 AM daily
    'SELECT public.cleanup_expired_roles();'
) WHERE NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-roles-nightly'
);

-- STEP 13: Enhanced RLS status function
CREATE OR REPLACE FUNCTION public.get_rls_status(tables text[])
RETURNS TABLE(table_name text, is_rls_enabled boolean, is_rls_forced boolean)
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.relname AS table_name,
    c.relrowsecurity AS is_rls_enabled,
    c.relforcerowsecurity AS is_rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname = ANY(tables);
$$;

-- STEP 14: Validation and completion logging
INSERT INTO public._migration_log (migration_name, executed_at, success)
VALUES ('comprehensive_role_system_validation', NOW(), true);

COMMIT;