-- Create role grants system for user role management
CREATE TYPE public.app_role AS ENUM ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin');

-- Create role_grants table
CREATE TABLE public.role_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  context TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one active grant per user-role-context combination
  CONSTRAINT unique_active_grant UNIQUE (user_id, role, context) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS
ALTER TABLE public.role_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own grants"
  ON public.role_grants
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all grants"
  ON public.role_grants
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can insert grants"
  ON public.role_grants
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can update grants"
  ON public.role_grants
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Admins can delete grants"
  ON public.role_grants
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_role_grants_user_id ON public.role_grants(user_id);
CREATE INDEX idx_role_grants_role ON public.role_grants(role);
CREATE INDEX idx_role_grants_active ON public.role_grants(is_active);
CREATE INDEX idx_role_grants_expires ON public.role_grants(expires_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_role_grants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_role_grants_updated_at
  BEFORE UPDATE ON public.role_grants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_role_grants_updated_at();

-- Grant role function
CREATE OR REPLACE FUNCTION public.grant_role(_user_id uuid, _role app_role, _context text DEFAULT NULL, _expires_at timestamptz DEFAULT NULL)
RETURNS role_grants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.role_grants;
BEGIN
  -- Check permissions
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to grant roles';
  END IF;

  -- Try to reactivate existing grant first
  UPDATE public.role_grants
  SET is_active = true,
      revoked_at = NULL,
      expires_at = _expires_at,
      updated_at = now(),
      granted_by = auth.uid(),
      granted_at = now()
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(context,'') = COALESCE(_context,'')
  RETURNING * INTO v_row;

  -- If no existing row was updated, create new grant
  IF v_row.id IS NULL THEN
    INSERT INTO public.role_grants (user_id, role, context, is_active, granted_by, expires_at)
    VALUES (_user_id, _role, _context, true, auth.uid(), _expires_at)
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

-- Revoke role function
CREATE OR REPLACE FUNCTION public.revoke_role(_user_id uuid, _role app_role, _context text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permissions
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role)) THEN
    RAISE EXCEPTION 'Insufficient privileges to revoke roles';
  END IF;

  -- Mark grant as revoked
  UPDATE public.role_grants
  SET is_active = false,
      revoked_at = now(),
      updated_at = now()
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(context,'') = COALESCE(_context,'')
    AND revoked_at IS NULL;
END;
$$;

-- Get user effective roles function
CREATE OR REPLACE FUNCTION public.get_user_effective_roles(_user_id uuid DEFAULT auth.uid())
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  roles_arr text[];
BEGIN
  -- Combine base roles and granted roles
  SELECT ARRAY(
    SELECT DISTINCT r::text FROM (
      -- Base roles from user_roles table
      SELECT ur.role::text AS r
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
      UNION
      -- Granted roles from role_grants table
      SELECT rg.role::text AS r
      FROM public.role_grants rg
      WHERE rg.user_id = _user_id
        AND rg.is_active = true
        AND rg.revoked_at IS NULL
        AND (rg.expires_at IS NULL OR rg.expires_at > now())
    ) AS combined
  ) INTO roles_arr;

  -- Return empty array if null
  RETURN COALESCE(roles_arr, ARRAY[]::text[]);
END;
$$;