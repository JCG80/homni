-- 1) Standardize RLS to avoid auth.jwt() dependency
-- Detached buildings: replace admin policy to use get_auth_user_role()
DROP POLICY IF EXISTS "Admins can manage detached buildings" ON public.detached_buildings;
CREATE POLICY "Admins can manage detached buildings"
ON public.detached_buildings
FOR ALL
USING (public.get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]))
WITH CHECK (public.get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]));

-- Keep public read as-is to preserve public catalog view
-- (No change to "Public can view detached buildings")

-- Company reviews: replace admin policy to use get_auth_user_role()
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.company_reviews;
CREATE POLICY "Admins can manage all reviews"
ON public.company_reviews
FOR ALL
USING (public.get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]))
WITH CHECK (public.get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]));

-- 2) Fix linter warning: Function search_path mutable on list_all_user_profiles
CREATE OR REPLACE FUNCTION public.list_all_user_profiles()
RETURNS TABLE(id uuid, full_name text, email text, phone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT id, full_name, email, phone, created_at, updated_at
    FROM public.user_profiles;
END;
$function$;