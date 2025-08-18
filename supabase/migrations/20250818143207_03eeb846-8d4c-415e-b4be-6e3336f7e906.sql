-- Fix RLS policies for user_profiles: clean slate approach
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile extended" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Create clean, unambiguous RLS policies
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_update_own"
ON public.user_profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin policies (admins can manage all profiles)
CREATE POLICY "user_profiles_admin_select_all"
ON public.user_profiles FOR SELECT TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]));

CREATE POLICY "user_profiles_admin_update_all"
ON public.user_profiles FOR UPDATE TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin'::text, 'master_admin'::text]));

-- Create secure profile upsert function with role normalization
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id uuid,
  p_role text DEFAULT NULL,
  p_company_id uuid DEFAULT NULL
) RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_row public.user_profiles;
BEGIN
  -- Normalize role to canonical values
  v_role := COALESCE(
    CASE lower(coalesce(p_role, 'anonymous'))
      WHEN 'guest' THEN 'anonymous'
      WHEN 'member' THEN 'user'
      WHEN 'regular' THEN 'user'
      WHEN 'basic' THEN 'user'
      WHEN 'customer' THEN 'user'
      WHEN 'business' THEN 'company'
      WHEN 'provider' THEN 'company'
      WHEN 'vendor' THEN 'company'
      WHEN 'buyer' THEN 'company'
      WHEN 'editor' THEN 'content_editor'
      WHEN 'moderator' THEN 'content_editor'
      WHEN 'content_admin' THEN 'content_editor'
      WHEN 'super_admin' THEN 'master_admin'
      WHEN 'root' THEN 'master_admin'
      WHEN 'system_admin' THEN 'master_admin'
      ELSE p_role
    END,
    'anonymous'
  );

  -- Upsert the profile (bypasses RLS with SECURITY DEFINER)
  INSERT INTO public.user_profiles (id, role, company_id, updated_at)
  VALUES (p_user_id, v_role, p_company_id, now())
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        company_id = COALESCE(EXCLUDED.company_id, public.user_profiles.company_id),
        updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END$$;