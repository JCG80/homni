-- Migration: unify company_profiles fields + RLS for role_switch_audit insert
-- Safe, idempotent operations with minimal impact

-- 0) Helper: updated_at trigger function with fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1) Company profiles: add missing unified model fields
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ui_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS feature_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 1b) Ensure updated_at updates automatically
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_company_profiles_updated_at'
      AND tgrelid = 'public.company_profiles'::regclass
  ) THEN
    -- drop and recreate to ensure latest function attributes
    DROP TRIGGER update_company_profiles_updated_at ON public.company_profiles;
  END IF;
END $$;

CREATE TRIGGER update_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Role switch audit: enable safe inserts by authenticated users for own records
ALTER TABLE public.role_switch_audit ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Users can insert own mode switches" ON public.role_switch_audit; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY IF EXISTS "Admins can insert mode switches" ON public.role_switch_audit; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Users can insert own mode switches"
ON public.role_switch_audit
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Note: We retain existing SELECT policies (users see own, admins see all)
-- This migration focuses on unblocking audit insertion and aligning company_profiles schema.
