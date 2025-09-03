-- Create user_company_roles pivot table for company membership
CREATE TABLE IF NOT EXISTS public.user_company_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('company_admin', 'agent', 'viewer')) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, company_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ucr_company ON public.user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_ucr_user ON public.user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_ucr_default ON public.user_company_roles(user_id, is_default) WHERE is_default = true;

-- Enable RLS
ALTER TABLE public.user_company_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_company_roles
CREATE POLICY "Users can view their own company roles"
ON public.user_company_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own company roles"
ON public.user_company_roles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all company roles"
ON public.user_company_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'master_admin')
  )
);

CREATE POLICY "Company admins can manage their company roles"
ON public.user_company_roles
FOR ALL
USING (
  company_id IN (
    SELECT ucr.company_id 
    FROM public.user_company_roles ucr
    WHERE ucr.user_id = auth.uid() 
    AND ucr.role = 'company_admin'
  )
)
WITH CHECK (
  company_id IN (
    SELECT ucr.company_id 
    FROM public.user_company_roles ucr
    WHERE ucr.user_id = auth.uid() 
    AND ucr.role = 'company_admin'
  )
);

-- Create admin_actions_log for audit trail
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_kind TEXT CHECK (target_kind IN ('user', 'company', 'lead', 'system')) NOT NULL,
  target_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.admin_actions_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON public.admin_actions_log(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.admin_actions_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_actions_log(created_at);

-- Enable RLS for audit log
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit log
CREATE POLICY "Only admins can view audit log"
ON public.admin_actions_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('admin', 'master_admin')
  )
);

CREATE POLICY "System can insert audit logs"
ON public.admin_actions_log
FOR INSERT
WITH CHECK (true);

-- Add feature flags for new functionality
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage, target_roles)
VALUES 
  ('role_dashboards_v1', 'Enable role-specific dashboards', true, 100, ARRAY['user', 'company', 'content_editor', 'admin', 'master_admin']::text[]),
  ('profile_switcher_v1', 'Enable profile switching for admins', true, 100, ARRAY['admin', 'master_admin']::text[])
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();

-- Helper function to get current company context
CREATE OR REPLACE FUNCTION public.get_current_company_context()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.company_id', true), '')::uuid;
$$;

-- Helper function to set company context
CREATE OR REPLACE FUNCTION public.set_company_context(company_uuid UUID)
RETURNS void
LANGUAGE sql
AS $$
  SELECT set_config('app.company_id', company_uuid::text, true);
$$;

-- Helper function to clear company context
CREATE OR REPLACE FUNCTION public.clear_company_context()
RETURNS void
LANGUAGE sql
AS $$
  SELECT set_config('app.company_id', '', true);
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  target_kind_param TEXT,
  target_id_param UUID,
  action_param TEXT,
  metadata_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
  session_ctx JSONB;
BEGIN
  -- Build session context
  session_ctx := jsonb_build_object(
    'company_id', NULLIF(current_setting('app.company_id', true), ''),
    'user_agent', current_setting('request.headers', true)::json->>'user-agent',
    'ip_address', inet_client_addr()::text
  );

  INSERT INTO public.admin_actions_log (
    actor_user_id,
    target_kind,
    target_id,
    action,
    metadata,
    session_context
  )
  VALUES (
    auth.uid(),
    target_kind_param,
    target_id_param,
    action_param,
    metadata_param,
    session_ctx
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- Create trigger for updated_at on user_company_roles
CREATE OR REPLACE FUNCTION public.update_user_company_roles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_company_roles_updated_at
  BEFORE UPDATE ON public.user_company_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_company_roles_updated_at();