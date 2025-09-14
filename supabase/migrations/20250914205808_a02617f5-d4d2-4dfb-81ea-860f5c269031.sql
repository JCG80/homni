-- STEP 0: Start transaksjon og loggingstabell
CREATE TABLE IF NOT EXISTS public._migration_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN,
    error_message TEXT
);

BEGIN;
INSERT INTO public._migration_log (migration_name, executed_at) 
VALUES ('role_system_rls_policies', NOW());

-- STEP 1: Opprett app_role enum
DO $$ 
BEGIN
    CREATE TYPE public.app_role AS ENUM ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin');
    INSERT INTO public._migration_log (migration_name, success) VALUES ('create_app_role_enum', TRUE);
EXCEPTION WHEN duplicate_object THEN 
    INSERT INTO public._migration_log (migration_name, success, error_message) 
    VALUES ('create_app_role_enum', TRUE, 'Enum already exists');
END $$;

-- STEP 2: Opprett user_roles tabell
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL CHECK (role <> 'guest'),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, role)
);

-- STEP 3: Enable RLS med FORCE
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- STEP 4: Hjelpefunksjoner
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
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
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level;
$$;

-- STEP 5: Policyer for user_roles
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
CREATE POLICY "Admins manage all roles" ON public.user_roles
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- STEP 6: Migrer eksisterende roller
DO $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, granted_at)
    SELECT user_id, role::public.app_role, created_at
    FROM public.user_profiles 
    WHERE role <> 'guest' AND user_id IS NOT NULL
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public._migration_log (migration_name, success) 
    VALUES ('migrate_existing_roles', TRUE);
EXCEPTION WHEN others THEN
    INSERT INTO public._migration_log (migration_name, success, error_message) 
    VALUES ('migrate_existing_roles', FALSE, SQLERRM);
END $$;

-- STEP 7: Create payment_records table if not exists
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 8: Oppdater policyer på sensitive tabeller
-- ADMIN_ACTIONS_LOG
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon read admin_actions_log" ON public.admin_actions_log;
DROP POLICY IF EXISTS "deny_anon_admin_actions" ON public.admin_actions_log;
DROP POLICY IF EXISTS "block_anon_admin_actions" ON public.admin_actions_log;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.admin_actions_log;
CREATE POLICY "Admins can read all admin_actions_log"
ON public.admin_actions_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users can read own admin_actions_log"
ON public.admin_actions_log FOR SELECT TO authenticated USING (actor_user_id = auth.uid());

-- PAYMENT_RECORDS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all payment_records"
ON public.payment_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users can read own payment_records"
ON public.payment_records FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own payment_records"
ON public.payment_records FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can insert any payment_records"
ON public.payment_records FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users can update own payment_records"
ON public.payment_records FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update any payment_records"
ON public.payment_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users can delete own payment_records"
ON public.payment_records FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can delete any payment_records"
ON public.payment_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- USER_PROFILES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon read user_profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all user_profiles"
ON public.user_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Users can read own user_profiles"
ON public.user_profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own user_profiles"
ON public.user_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update any user_profiles"
ON public.user_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
CREATE POLICY "Admins can delete any user_profiles"
ON public.user_profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- STEP 9: Indekser
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON public.user_roles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(user_id, role) WHERE (expires_at IS NULL OR expires_at > NOW());
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_actor ON public.admin_actions_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);

-- STEP 10: Overvåkning og opprydding
CREATE OR REPLACE VIEW public.expired_roles AS
SELECT user_id, role, expires_at, granted_at
FROM public.user_roles 
WHERE expires_at < NOW();

CREATE OR REPLACE FUNCTION public.cleanup_expired_roles()
RETURNS VOID
LANGUAGE SQL SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM public.user_roles WHERE expires_at < NOW();
$$;

-- STEP 11: Grant revoke functions
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

  -- Insert new role grant
  INSERT INTO public.user_roles (user_id, role, granted_by, expires_at)
  VALUES (_user_id, _role, auth.uid(), _expires_at)
  ON CONFLICT (user_id, role) DO UPDATE
    SET granted_by = auth.uid(),
        expires_at = _expires_at,
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

  -- Remove role
  DELETE FROM public.user_roles
  WHERE user_id = _user_id AND role = _role;
END;
$$;

COMMIT;
INSERT INTO public._migration_log (migration_name, success) VALUES ('role_system_rls_policies', TRUE);