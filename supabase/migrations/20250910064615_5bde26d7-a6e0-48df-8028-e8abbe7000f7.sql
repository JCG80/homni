-- feat(db): Canonicalize roles using enum app_role and update policies/triggers
-- Transactional migration
BEGIN;

-- 1) Ensure enum app_role exists (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('guest','user','company','content_editor','admin','master_admin');
  END IF;
END $$;

-- 2) Normalize existing user_profiles.role values as text to canonical values
--    Ensure safe casting to enum in the next step
UPDATE public.user_profiles
SET role = CASE
  WHEN role IS NULL THEN 'user'
  WHEN lower(role) IN ('guest','user','company','content_editor','admin','master_admin') THEN lower(role)
  WHEN lower(role) IN ('anonymous','anon') THEN 'guest'
  WHEN lower(role) IN ('member','regular','basic','customer') THEN 'user'
  WHEN lower(role) IN ('business','provider','vendor','buyer') THEN 'company'
  WHEN lower(role) IN ('editor','moderator','content_admin') THEN 'content_editor'
  WHEN lower(role) IN ('super_admin','root','system_admin') THEN 'master_admin'
  ELSE 'user'
END;

-- 3) Convert column type to enum app_role safely
ALTER TABLE public.user_profiles
ALTER COLUMN role TYPE public.app_role
USING (
  CASE
    WHEN role IS NULL THEN 'user'
    ELSE role::text
  END
)::public.app_role;

-- 4) Update ensure_user_profile to write enum values correctly and keep normalization
CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id uuid, p_role text DEFAULT NULL::text, p_company_id uuid DEFAULT NULL::uuid)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
  v_row public.user_profiles;
BEGIN
  -- Normalise role to canonical values
  v_role := COALESCE(
    CASE lower(coalesce(p_role, 'user'))
      WHEN 'anonymous' THEN 'guest'
      WHEN 'anon' THEN 'guest'
      WHEN 'guest' THEN 'guest'
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
      WHEN 'admin' THEN 'admin'
      WHEN 'content_editor' THEN 'content_editor'
      WHEN 'company' THEN 'company'
      WHEN 'user' THEN 'user'
      WHEN 'master_admin' THEN 'master_admin'
      ELSE 'user'
    END,
    'user'
  );

  -- Insert or update profile with both id and user_id set to the same value
  INSERT INTO public.user_profiles (
    id, 
    user_id, 
    role, 
    company_id,
    metadata,
    notification_preferences,
    ui_preferences,
    feature_overrides
  )
  VALUES (
    p_user_id, 
    p_user_id, 
    v_role::public.app_role, 
    p_company_id,
    COALESCE('{}'::jsonb, '{}'),
    COALESCE('{}'::jsonb, '{}'),
    COALESCE('{}'::jsonb, '{}'),
    COALESCE('{}'::jsonb, '{}')
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      user_id = p_user_id,
      role = (CASE WHEN EXCLUDED.role IS NOT NULL THEN EXCLUDED.role ELSE public.user_profiles.role END),
      company_id = COALESCE(EXCLUDED.company_id, public.user_profiles.company_id),
      updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END
$function$;

-- 5) Update validation function to work with enum type
CREATE OR REPLACE FUNCTION public.validate_user_role_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Enum guarantees validity; keep defensive check
  IF NEW.role::text NOT IN ('guest','user','company','content_editor','admin','master_admin') THEN
    RAISE EXCEPTION 'Invalid role: %', NEW.role;
  END IF;
  
  -- Ensure user_id = id
  IF NEW.user_id != NEW.id THEN
    NEW.user_id := NEW.id;
  END IF;
  
  -- Auto-set account_type in metadata
  NEW.metadata := jsonb_set(
    COALESCE(NEW.metadata, '{}'::jsonb),
    '{account_type}',
    CASE WHEN NEW.company_id IS NOT NULL THEN '"company"'::jsonb ELSE '"user"'::jsonb END
  );
  
  RETURN NEW;
END;
$function$;

-- 6) Attach validation trigger (idempotent via drop-if-exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_user_profiles_validate_role' 
      AND tgrelid = 'public.user_profiles'::regclass
  ) THEN
    DROP TRIGGER trg_user_profiles_validate_role ON public.user_profiles;
  END IF;
END$$;

CREATE TRIGGER trg_user_profiles_validate_role
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_user_role_consistency();

-- 7) Fix policies that compared enum to text literals
-- admin_actions_log policy
DROP POLICY IF EXISTS "Only admins can view audit log" ON public.admin_actions_log;

CREATE POLICY "Only admins can view audit log" 
ON public.admin_actions_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.role = ANY (ARRAY['admin'::public.app_role, 'master_admin'::public.app_role])
  )
);

-- module_metadata policy
DROP POLICY IF EXISTS "Only admins can modify module metadata" ON public.module_metadata;

CREATE POLICY "Only admins can modify module metadata" 
ON public.module_metadata 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = ANY (ARRAY['admin'::public.app_role, 'master_admin'::public.app_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = ANY (ARRAY['admin'::public.app_role, 'master_admin'::public.app_role])
  )
);

COMMIT;