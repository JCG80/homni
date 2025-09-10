-- feat(db): Phased role canonicalization via new enum column role_enum while preserving policies
BEGIN;

-- 1) Ensure enum app_role exists (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('guest','user','company','content_editor','admin','master_admin');
  END IF;
END $$;

-- 2) Add new enum column role_enum, default 'user'
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS role_enum public.app_role;

-- 3) Normalize existing text role and backfill role_enum
UPDATE public.user_profiles
SET 
  role = CASE
    WHEN role IS NULL THEN 'user'
    WHEN lower(role) IN ('guest','user','company','content_editor','admin','master_admin') THEN lower(role)
    WHEN lower(role) IN ('anonymous','anon') THEN 'guest'
    WHEN lower(role) IN ('member','regular','basic','customer') THEN 'user'
    WHEN lower(role) IN ('business','provider','vendor','buyer') THEN 'company'
    WHEN lower(role) IN ('editor','moderator','content_admin') THEN 'content_editor'
    WHEN lower(role) IN ('super_admin','root','system_admin') THEN 'master_admin'
    ELSE 'user'
  END,
  role_enum = CASE
    WHEN role IS NULL THEN 'user'::public.app_role
    WHEN lower(role) IN ('guest','user','company','content_editor','admin','master_admin') THEN lower(role)::public.app_role
    WHEN lower(role) IN ('anonymous','anon') THEN 'guest'::public.app_role
    WHEN lower(role) IN ('member','regular','basic','customer') THEN 'user'::public.app_role
    WHEN lower(role) IN ('business','provider','vendor','buyer') THEN 'company'::public.app_role
    WHEN lower(role) IN ('editor','moderator','content_admin') THEN 'content_editor'::public.app_role
    WHEN lower(role) IN ('super_admin','root','system_admin') THEN 'master_admin'::public.app_role
    ELSE 'user'::public.app_role
  END
WHERE role_enum IS NULL OR role_enum::text <> lower(role);

-- 4) Ensure role_enum is NOT NULL with default
ALTER TABLE public.user_profiles
ALTER COLUMN role_enum SET NOT NULL,
ALTER COLUMN role_enum SET DEFAULT 'user'::public.app_role;

-- 5) Create sync trigger function to keep role and role_enum consistent
CREATE OR REPLACE FUNCTION public.sync_user_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role_text text;
  v_role_enum public.app_role;
BEGIN
  -- Determine source of truth for this change
  IF TG_OP = 'INSERT' THEN
    v_role_text := COALESCE(NEW.role, NULLIF(NEW.role_enum::text, ''));
  ELSE
    v_role_text := COALESCE(NEW.role, OLD.role);
  END IF;

  -- Normalize role text first
  v_role_text := COALESCE(
    CASE lower(coalesce(v_role_text, 'user'))
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

  -- Compute enum from normalized text
  v_role_enum := v_role_text::public.app_role;

  -- Set both columns to canonical values
  NEW.role := v_role_text;
  NEW.role_enum := v_role_enum;

  RETURN NEW;
END;
$function$;

-- 6) Attach sync trigger (before insert/update)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_user_profiles_sync_role' 
      AND tgrelid = 'public.user_profiles'::regclass
  ) THEN
    DROP TRIGGER trg_user_profiles_sync_role ON public.user_profiles;
  END IF;
END$$;

CREATE TRIGGER trg_user_profiles_sync_role
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_profile_role();

-- 7) Keep existing validation trigger; adjust to use enum defensively
CREATE OR REPLACE FUNCTION public.validate_user_role_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure normalized sync already happened; keep defensive checks
  IF NEW.role_enum::text NOT IN ('guest','user','company','content_editor','admin','master_admin') THEN
    RAISE EXCEPTION 'Invalid role_enum: %', NEW.role_enum;
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

-- 8) Reattach validation trigger (idempotent)
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

-- 9) Update ensure_user_profile to set both columns
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

  -- Insert or update profile
  INSERT INTO public.user_profiles (
    id, 
    user_id, 
    role, 
    role_enum,
    company_id,
    metadata,
    notification_preferences,
    ui_preferences,
    feature_overrides
  )
  VALUES (
    p_user_id, 
    p_user_id, 
    v_role, 
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
      role = v_role,
      role_enum = v_role::public.app_role,
      company_id = COALESCE(EXCLUDED.company_id, public.user_profiles.company_id),
      updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END
$function$;

COMMIT;