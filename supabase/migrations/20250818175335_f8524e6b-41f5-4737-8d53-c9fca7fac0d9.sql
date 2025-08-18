-- Fix parameter order for has_role_grant to satisfy default-value rules
CREATE OR REPLACE FUNCTION public.has_role_grant(
  _role app_role,
  _user_id uuid DEFAULT auth.uid(),
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