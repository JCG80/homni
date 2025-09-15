-- Drop existing search_users function if it exists
DROP FUNCTION IF EXISTS public.search_users(TEXT);

-- Enhanced roles system with views, RPC functions, and OTP support

-- Create view for role overview (only active roles + user profiles)
CREATE OR REPLACE VIEW public.user_roles_overview_v
WITH (security_invoker = ON) AS
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
  up.full_name AS user_display_name,
  up.email AS user_email,
  gb.full_name AS granted_by_display_name,
  gb.email AS granted_by_email
FROM public.user_roles ur
LEFT JOIN public.user_profiles up ON up.id = ur.user_id
LEFT JOIN public.user_profiles gb ON gb.id = ur.granted_by
WHERE ur.is_active = TRUE;

-- Grant select access to authenticated users
GRANT SELECT ON public.user_roles_overview_v TO authenticated;

-- Create enhanced search_users function (admin level 80+)
CREATE OR REPLACE FUNCTION public.search_users(term TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  active_roles public.app_role[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.id,
    up.full_name,
    up.email,
    COALESCE(
      array_agg(ur.role ORDER BY ur.role) FILTER (WHERE ur.is_active = TRUE),
      '{}'
    )::public.app_role[]
  FROM public.user_profiles up
  LEFT JOIN public.user_roles ur ON ur.user_id = up.id AND ur.is_active = TRUE
  WHERE 
    public.has_role_level(auth.uid(), 80)
    AND LENGTH(TRIM(COALESCE(term, ''))) >= 2
    AND (
      up.full_name ILIKE '%' || term || '%' 
      OR up.email ILIKE '%' || term || '%'
    )
  GROUP BY up.id, up.full_name, up.email
  ORDER BY up.full_name NULLS LAST
  LIMIT 20;
$$;

-- Revoke and grant permissions
REVOKE ALL ON FUNCTION public.search_users(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.search_users(TEXT) TO authenticated;