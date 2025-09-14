-- Phase 1: Core Role Management System
-- migrations/20250115_advanced_roles_core.sql

-- 1) Core roles table with levels
CREATE TABLE IF NOT EXISTS public.roles (
  name text PRIMARY KEY,
  level int NOT NULL CHECK (level >= 0 AND level <= 100),
  description text,
  is_assignable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Role scopes for module/organization-level permissions
CREATE TABLE IF NOT EXISTS public.role_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3) Enhanced user roles with scope support
-- First, add scope_key column to existing user_roles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'scope_key') THEN
    ALTER TABLE public.user_roles ADD COLUMN scope_key text REFERENCES public.role_scopes(key) ON UPDATE CASCADE;
  END IF;
END $$;

-- Update primary key to include scope_key
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'user_roles' AND constraint_name = 'user_roles_pkey_with_scope') THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey_with_scope PRIMARY KEY (user_id, role, COALESCE(scope_key, ''));
  END IF;
END $$;

-- 4) Role templates for standardized assignments
CREATE TABLE IF NOT EXISTS public.role_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_template_items (
  template_id uuid REFERENCES public.role_templates(id) ON DELETE CASCADE,
  role text NOT NULL,
  scope_key text REFERENCES public.role_scopes(key) ON UPDATE CASCADE,
  expires_days int,
  PRIMARY KEY (template_id, role, COALESCE(scope_key, ''))
);

-- 5) Segregation of Duties (SoD) conflicts
CREATE TABLE IF NOT EXISTS public.sod_conflicts (
  role_a text NOT NULL,
  role_b text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_a, role_b),
  CHECK (role_a < role_b) -- Ensure consistent ordering
);

-- 6) Audit lock mechanism
CREATE TABLE IF NOT EXISTS public.audit_locks (
  id boolean PRIMARY KEY DEFAULT true,
  is_locked boolean NOT NULL DEFAULT false,
  reason text,
  locked_by uuid,
  locked_at timestamptz,
  CHECK (id = true) -- Singleton pattern
);

-- 7) Self-service role requests
CREATE TABLE IF NOT EXISTS public.role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester uuid NOT NULL,
  role text NOT NULL,
  scope_key text REFERENCES public.role_scopes(key),
  justification text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by uuid,
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8) Admin action challenges (2FA/OTP)
CREATE TABLE IF NOT EXISTS public.admin_action_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  payload jsonb NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9) Enhanced audit log
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id bigserial PRIMARY KEY,
  actor uuid,
  action text NOT NULL,
  target_user uuid,
  role text,
  scope_key text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet DEFAULT inet_client_addr(),
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_scope ON public.user_roles(user_id, scope_key);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_level ON public.user_roles(role) WHERE expires_at IS NULL OR expires_at > now();
CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_user ON public.role_audit_log(target_user, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_action ON public.role_audit_log(actor, action, created_at);

-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Insert default roles
INSERT INTO public.roles (name, level, description, is_assignable) VALUES
('guest', 0, 'Unauthenticated users', false),
('user', 20, 'Standard authenticated users', true),
('company', 40, 'Company/business users', true),
('content_editor', 60, 'Content management access', true),
('admin', 80, 'System administrators', true),
('master_admin', 100, 'Super administrators', true)
ON CONFLICT (name) DO UPDATE SET
  level = EXCLUDED.level,
  description = EXCLUDED.description;

-- Insert default scopes
INSERT INTO public.role_scopes (key, description) VALUES
('global', 'Global system access'),
('module:leads', 'Lead management module'),
('module:properties', 'Property management module'),
('module:analytics', 'Analytics and reporting'),
('module:admin', 'Administrative functions'),
('module:content', 'Content management')
ON CONFLICT (key) DO NOTHING;

-- Insert singleton audit lock record
INSERT INTO public.audit_locks (id, is_locked) VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

-- Update triggers
CREATE OR REPLACE FUNCTION public.update_role_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_roles_timestamp
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_role_timestamps();

CREATE TRIGGER update_role_templates_timestamp
  BEFORE UPDATE ON public.role_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_role_timestamps();

CREATE TRIGGER update_role_requests_timestamp
  BEFORE UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_role_timestamps();