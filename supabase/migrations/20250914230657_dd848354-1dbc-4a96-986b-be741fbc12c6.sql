-- Drop all conflicting functions first
DROP FUNCTION IF EXISTS public.get_user_role_level(uuid);
DROP FUNCTION IF EXISTS public.has_role_level(uuid, integer);
DROP FUNCTION IF EXISTS public.grant_user_role(uuid, public.app_role, text, text);
DROP FUNCTION IF EXISTS public.revoke_user_role(uuid, public.app_role, text);

-- Update any existing 'member' roles to 'user' in user_profiles
UPDATE public.user_profiles 
SET role = 'user' 
WHERE role = 'member';

-- Update any existing 'member' roles to 'user' in user_roles if they exist
UPDATE public.user_roles 
SET role = 'user'::app_role 
WHERE role::text = 'member';

-- Add missing revoked_by column to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS revoked_by uuid;

-- Create user_roles_overview_v view with user information
CREATE OR REPLACE VIEW public.user_roles_overview_v
WITH (security_invoker = on) AS
SELECT
  ur.user_id,
  ur.role,
  ur.scope_key,
  ur.expires_at,
  ur.granted_by,
  ur.granted_at,
  ur.is_active,
  ur.revoked_at,
  ur.revoked_by,
  up.full_name as user_display_name,
  up.email as user_email,
  gp.full_name as granted_by_display_name,
  gp.email as granted_by_email
FROM public.user_roles ur
LEFT JOIN public.user_profiles up ON up.id = ur.user_id
LEFT JOIN public.user_profiles gp ON gp.id = ur.granted_by
WHERE ur.is_active = true 
  AND (ur.expires_at IS NULL OR ur.expires_at > now());

GRANT SELECT ON public.user_roles_overview_v TO authenticated;

-- Create search_users RPC function for secure user search
CREATE OR REPLACE FUNCTION public.search_users(term text)
RETURNS TABLE(id uuid, full_name text, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.id,
    up.full_name,
    up.email
  FROM public.user_profiles up
  WHERE 
    -- Only allow admins to search users
    (EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin'::app_role, 'master_admin'::app_role)
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    ))
    AND (
      up.full_name ILIKE '%' || term || '%' 
      OR up.email ILIKE '%' || term || '%'
    )
  ORDER BY up.full_name, up.email
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.search_users(text) TO authenticated;

-- Create helper functions for role level access
CREATE OR REPLACE FUNCTION public.get_user_role_level(_uid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(
    CASE ur.role
      WHEN 'master_admin'::app_role THEN 100
      WHEN 'admin'::app_role THEN 80
      WHEN 'content_editor'::app_role THEN 60
      WHEN 'company'::app_role THEN 40
      WHEN 'user'::app_role THEN 20
      WHEN 'guest'::app_role THEN 0
      ELSE 0
    END
  ), 0)
  FROM public.user_roles ur
  WHERE ur.user_id = _uid 
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.has_role_level(_uid uuid, _min_level integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role_level(_uid) >= _min_level;
$$;

-- Update grant_user_role to handle soft reactivation with revoked_by
CREATE OR REPLACE FUNCTION public.grant_user_role(
  _user_id uuid, 
  _role public.app_role, 
  _expires_date text DEFAULT NULL,
  _scope_key text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expires_ts timestamptz;
BEGIN
  -- Only admins can grant roles
  IF NOT public.has_role_level(auth.uid(), 80) THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges';
  END IF;

  -- Parse expiration date
  IF _expires_date IS NOT NULL AND _expires_date != '' THEN
    expires_ts := (_expires_date || ' 23:59:59')::timestamp AT TIME ZONE 'UTC';
  END IF;

  -- Insert or reactivate role
  INSERT INTO public.user_roles (
    user_id, role, scope_key, expires_at, granted_by, granted_at, 
    is_active, revoked_at, revoked_by
  )
  VALUES (
    _user_id, _role, _scope_key, expires_ts, auth.uid(), now(),
    true, NULL, NULL
  )
  ON CONFLICT (user_id, role, COALESCE(scope_key, ''))
  DO UPDATE SET
    expires_at = EXCLUDED.expires_at,
    granted_by = auth.uid(),
    granted_at = now(),
    is_active = true,
    revoked_at = NULL,
    revoked_by = NULL;
END;
$$;

-- Update revoke_user_role to use soft revoke with revoked_by
CREATE OR REPLACE FUNCTION public.revoke_user_role(
  _user_id uuid, 
  _role public.app_role,
  _scope_key text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can revoke roles
  IF NOT public.has_role_level(auth.uid(), 80) THEN
    RAISE EXCEPTION 'Access denied: insufficient privileges';
  END IF;

  UPDATE public.user_roles
  SET 
    is_active = false,
    revoked_at = now(),
    revoked_by = auth.uid()
  WHERE 
    user_id = _user_id 
    AND role = _role 
    AND COALESCE(scope_key, '') = COALESCE(_scope_key, '')
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role not found or already revoked';
  END IF;
END;
$$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_active_user ON public.user_roles(is_active, user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active_role ON public.user_roles(is_active, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON public.user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Update RLS policies for user_roles
DROP POLICY IF EXISTS "user_roles_read_scoped" ON public.user_roles;
CREATE POLICY "user_roles_read_scoped"
ON public.user_roles FOR SELECT
USING (
  public.has_role_level(auth.uid(), 80)
  OR (user_id = auth.uid() AND is_active = true)
);

-- Revoke direct table access - force use of RPC functions
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;