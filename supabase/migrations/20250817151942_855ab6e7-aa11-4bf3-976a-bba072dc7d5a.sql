BEGIN;

-- 1) Standardize user_profiles schema
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS account_type text,
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ui_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS feature_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Backfill and enforce user_id NOT NULL
UPDATE public.user_profiles
SET user_id = id
WHERE user_id IS NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN user_id SET NOT NULL;

-- 2) Helper functions for role and company context
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Prefer role from user_profiles
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  IF user_role IS NOT NULL THEN
    RETURN user_role;
  END IF;

  -- Fallback to auth.users raw metadata
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'member');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- 3) Fix RLS on leads to be role-consistent and company-aware
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads;
DROP POLICY IF EXISTS "Companies can update their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;

CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Companies can view assigned leads"
  ON public.leads
  FOR SELECT
  USING (
    public.get_auth_user_role() = 'company'
    AND company_id IS NOT NULL
    AND company_id = public.get_current_user_company_id()
  );

CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

CREATE POLICY "Users can create their own leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Companies can update their assigned leads"
  ON public.leads
  FOR UPDATE
  USING (
    public.get_auth_user_role() = 'company'
    AND company_id = public.get_current_user_company_id()
  );

CREATE POLICY "Admins can update any lead"
  ON public.leads
  FOR UPDATE
  USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

-- 4) Align lead_history RLS
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all lead history" ON public.lead_history;
DROP POLICY IF EXISTS "Companies can view history for their leads" ON public.lead_history;

CREATE POLICY "Admins can view all lead history"
  ON public.lead_history
  FOR SELECT
  USING (public.get_auth_user_role() IN ('admin', 'master_admin'));

CREATE POLICY "Companies can view history for their leads"
  ON public.lead_history
  FOR SELECT
  USING (
    public.get_auth_user_role() = 'company'
    AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_history.lead_id
        AND l.company_id = public.get_current_user_company_id()
    )
  );

-- 5) Create module_metadata table with RLS and triggers
CREATE TABLE IF NOT EXISTS public.module_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  version text NOT NULL,
  dependencies text[] NOT NULL DEFAULT '{}',
  feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.module_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Module metadata viewable by authenticated" ON public.module_metadata;
DROP POLICY IF EXISTS "Admins can manage module metadata" ON public.module_metadata;

CREATE POLICY "Module metadata viewable by authenticated"
  ON public.module_metadata
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage module metadata"
  ON public.module_metadata
  FOR ALL
  USING (public.get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('admin','master_admin'));

DROP TRIGGER IF EXISTS trg_update_module_metadata_updated_at ON public.module_metadata;
CREATE TRIGGER trg_update_module_metadata_updated_at
BEFORE UPDATE ON public.module_metadata
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Normalize feature_flags: rename column, add RLS, update function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='feature_flags' AND column_name='percentage_rollout'
  ) THEN
    ALTER TABLE public.feature_flags RENAME COLUMN percentage_rollout TO rollout_percentage;
  END IF;
END $$;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feature flags viewable by authenticated" ON public.feature_flags;
DROP POLICY IF EXISTS "Only admins can manage feature flags" ON public.feature_flags;

CREATE POLICY "Feature flags viewable by authenticated"
  ON public.feature_flags
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage feature flags"
  ON public.feature_flags
  FOR ALL
  USING (public.get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('admin','master_admin'));

CREATE OR REPLACE FUNCTION public.is_feature_enabled(flag_name text, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  flag_record RECORD;
  user_role TEXT;
  random_value FLOAT;
BEGIN
  -- Prefer role from user_profiles
  SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id;
  IF user_role IS NULL THEN
    SELECT raw_user_meta_data->>'role' INTO user_role FROM auth.users WHERE id = user_id;
  END IF;
  
  SELECT 
    is_enabled, 
    rollout_percentage, 
    target_roles
  INTO flag_record
  FROM public.feature_flags
  WHERE name = flag_name;
  
  IF NOT FOUND OR NOT flag_record.is_enabled THEN
    RETURN FALSE;
  END IF;
  
  IF flag_record.target_roles IS NOT NULL AND 
     array_length(flag_record.target_roles, 1) > 0 AND
     NOT (user_role = ANY(flag_record.target_roles)) THEN
    RETURN FALSE;
  END IF;
  
  IF flag_record.rollout_percentage < 100 THEN
    random_value := abs(('x' || md5(user_id::text || flag_name))::bit(32)::int / 2147483647.0::float);
    RETURN (random_value * 100) < flag_record.rollout_percentage;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- 7) company_profiles: add deleted_at for parity
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMIT;