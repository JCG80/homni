-- ROLE GRANTS SYSTEM: table, RLS, functions, triggers, indexes

-- 1) Table
CREATE TABLE IF NOT EXISTS public.role_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  context text,
  is_active boolean NOT NULL DEFAULT true,
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) RLS
ALTER TABLE public.role_grants ENABLE ROW LEVEL SECURITY;

-- Admins can view all grants
DROP POLICY IF EXISTS "Admins can view all grants" ON public.role_grants;
CREATE POLICY "Admins can view all grants"
ON public.role_grants
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Users can view their own grants
DROP POLICY IF EXISTS "Users can view their own grants" ON public.role_grants;
CREATE POLICY "Users can view their own grants"
ON public.role_grants
FOR SELECT
USING (user_id = auth.uid());

-- Admins can insert grants
DROP POLICY IF EXISTS "Admins can insert grants" ON public.role_grants;
CREATE POLICY "Admins can insert grants"
ON public.role_grants
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Admins can update grants
DROP POLICY IF EXISTS "Admins can update grants" ON public.role_grants;
CREATE POLICY "Admins can update grants"
ON public.role_grants
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Admins can delete grants
DROP POLICY IF EXISTS "Admins can delete grants" ON public.role_grants;
CREATE POLICY "Admins can delete grants"
ON public.role_grants
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_role_grants_user ON public.role_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_role_grants_role ON public.role_grants(role);
CREATE INDEX IF NOT EXISTS idx_role_grants_active ON public.role_grants(is_active) WHERE is_active = true AND revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_role_grants_unique_active ON public.role_grants (user_id, role, COALESCE(context, '')) WHERE is_active = true AND revoked_at IS NULL;

-- 4) Validation trigger (no time-based CHECKs)
CREATE OR REPLACE FUNCTION public.validate_role_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_role_grant ON public.role_grants;
CREATE TRIGGER trg_validate_role_grant
BEFORE INSERT OR UPDATE ON public.role_grants
FOR EACH ROW
EXECUTE FUNCTION public.validate_role_grant();

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_role_grants_updated_at ON public.role_grants;
CREATE TRIGGER trg_role_grants_updated_at
BEFORE UPDATE ON public.role_grants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Functions
-- has_role_grant
CREATE OR REPLACE FUNCTION public.has_role_grant(
  _user_id uuid DEFAULT auth.uid(),
  _role app_role,
  _context text DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_grants rg
    WHERE rg.user_id = COALESCE(_user_id, auth.uid())
      AND rg.role = _role
      AND rg.is_active = true
      AND rg.revoked_at IS NULL
      AND (rg.expires_at IS NULL OR rg.expires_at > now())
      AND (_context IS NULL OR rg.context = _context)
  );
$$;

-- grant_role
CREATE OR REPLACE FUNCTION public.grant_role(
  _user_id uuid,
  _role app_role,
  _context text DEFAULT NULL,
  _expires_at timestamptz DEFAULT NULL
)
RETURNS public.role_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.role_grants;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to grant roles';
  END IF;

  -- Reactivate if exists
  UPDATE public.role_grants
  SET is_active = true,
      revoked_at = NULL,
      expires_at = _expires_at,
      updated_at = now(),
      granted_by = auth.uid(),
      granted_at = now()
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(context,'') = COALESCE(_context,'')
  RETURNING * INTO v_row;

  IF v_row.id IS NOT NULL THEN
    RETURN v_row;
  END IF;

  INSERT INTO public.role_grants (user_id, role, context, is_active, granted_by, expires_at)
  VALUES (_user_id, _role, _context, true, auth.uid(), _expires_at)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- revoke_role
CREATE OR REPLACE FUNCTION public.revoke_role(
  _user_id uuid,
  _role app_role,
  _context text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to revoke roles';
  END IF;

  UPDATE public.role_grants
  SET is_active = false,
      revoked_at = now(),
      updated_at = now()
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(context,'') = COALESCE(_context,'')
    AND revoked_at IS NULL;
END;
$$;

-- is_master_admin
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    public.has_role(_user_id, 'master_admin'::app_role)
    OR public.has_role_grant(_user_id, 'master_admin'::app_role),
    FALSE
  );
$$;

-- get_user_effective_roles
CREATE OR REPLACE FUNCTION public.get_user_effective_roles(_user_id uuid DEFAULT auth.uid())
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  roles_arr text[];
BEGIN
  SELECT ARRAY(
    SELECT DISTINCT r::text FROM (
      SELECT ur.role::text AS r
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
      UNION
      SELECT rg.role::text AS r
      FROM public.role_grants rg
      WHERE rg.user_id = _user_id
        AND rg.is_active = true
        AND rg.revoked_at IS NULL
        AND (rg.expires_at IS NULL OR rg.expires_at > now())
    ) AS combined
  ) INTO roles_arr;

  IF roles_arr IS NULL THEN
    roles_arr := ARRAY[]::text[];
  END IF;

  RETURN roles_arr;
END;
$$;