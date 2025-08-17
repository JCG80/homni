-- Priority 2: DB security – role infrastructure and hardened RLS
-- 1) app_role enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('member','company','content_editor','admin','master_admin');
  END IF;
END$$;

-- 2) user_roles table (idempotent)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Secure helper: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(_user_id, auth.uid())
      AND ur.role = _role
  );
$$;

-- 4) Update get_auth_user_role to prefer user_roles (highest precedence), fallback to profiles, then auth.users metadata
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r text;
BEGIN
  -- Prefer user_roles with precedence
  SELECT ur.role::text INTO r
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  ORDER BY CASE ur.role
    WHEN 'master_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'company' THEN 3
    WHEN 'content_editor' THEN 4
    WHEN 'member' THEN 5
    ELSE 100
  END
  LIMIT 1;

  IF r IS NOT NULL THEN
    RETURN r;
  END IF;

  -- Fallback to user_profiles.role
  SELECT up.role INTO r
  FROM public.user_profiles up
  WHERE up.id = auth.uid();

  IF r IS NOT NULL THEN
    RETURN r;
  END IF;

  -- Fallback to auth.users raw metadata
  SELECT au.raw_user_meta_data->>'role' INTO r
  FROM auth.users au
  WHERE au.id = auth.uid();
  
  RETURN COALESCE(r, 'member');
END;
$$;

-- 5) RLS policies for user_roles (idempotent drops, then creates)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 6) Harden leads policies to use has_role while keeping existing behavior
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing to avoid duplicates
DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can update their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;

-- Recreate policies
CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
USING (auth.uid() = submitted_by);

CREATE POLICY "Companies can view assigned leads"
ON public.leads
FOR SELECT
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND company_id IS NOT NULL
  AND company_id = public.get_current_user_company_id()
);

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Users can create their own leads"
ON public.leads
FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Companies can update their assigned leads"
ON public.leads
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND company_id = public.get_current_user_company_id()
);

CREATE POLICY "Admins can update any lead"
ON public.leads
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);
