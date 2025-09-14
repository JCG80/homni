-- Drop problematic function and all dependencies, then implement secure role system
-- migrations/20250115_role_system_secure.sql

-- Drop the problematic function with all its dependencies
DROP FUNCTION IF EXISTS public.validate_user_role_consistency() CASCADE;

-- Core role management tables
CREATE TABLE IF NOT EXISTS public.roles (
  name text PRIMARY KEY,
  level int NOT NULL CHECK (level >= 0 AND level <= 100),
  description text,
  is_assignable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add scope support to existing user_roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'scope_key') THEN
    ALTER TABLE public.user_roles ADD COLUMN scope_key text;
  END IF;
END $$;

-- Role templates for batch operations
CREATE TABLE IF NOT EXISTS public.role_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.role_templates(id) ON DELETE CASCADE,
  role text NOT NULL,
  scope_key text,
  expires_days int
);

-- Segregation of Duties conflicts
CREATE TABLE IF NOT EXISTS public.sod_conflicts (
  role_a text NOT NULL,
  role_b text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_a, role_b),
  CHECK (role_a < role_b)
);

-- Audit lock for compliance mode
CREATE TABLE IF NOT EXISTS public.audit_locks (
  id boolean PRIMARY KEY DEFAULT true,
  is_locked boolean NOT NULL DEFAULT false,
  reason text,
  locked_by uuid,
  locked_at timestamptz,
  CHECK (id = true)
);

-- Self-service role requests
CREATE TABLE IF NOT EXISTS public.role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester uuid NOT NULL,
  role text NOT NULL,
  scope_key text,
  justification text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_by uuid,
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2FA/OTP challenges for critical actions
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

-- Enhanced audit logging
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

-- Insert default role hierarchy
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

-- Initialize audit lock
INSERT INTO public.audit_locks (id, is_locked) VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_scope ON public.user_roles(user_id, scope_key);
CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON public.role_audit_log(target_user, created_at);

-- Enable fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;