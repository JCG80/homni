-- Create role_grants table for managing user role permissions
CREATE TABLE IF NOT EXISTS public.role_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_role TEXT NOT NULL CHECK (granted_role IN ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  context JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique active grants per user per role per context
  UNIQUE(user_id, granted_role, context) WHERE is_active = true
);

-- Enable Row Level Security
ALTER TABLE public.role_grants ENABLE ROW LEVEL SECURITY;

-- Create policies for role_grants table
CREATE POLICY "Users can view their own role grants" 
ON public.role_grants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all role grants" 
ON public.role_grants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
);

CREATE POLICY "Master admins can manage all role grants" 
ON public.role_grants 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'master_admin'
  )
);

CREATE POLICY "Admins can grant limited roles" 
ON public.role_grants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'master_admin')
  )
  AND granted_role IN ('user', 'company', 'content_editor')
);

-- Create indexes for performance
CREATE INDEX idx_role_grants_user_id ON public.role_grants(user_id);
CREATE INDEX idx_role_grants_granted_role ON public.role_grants(granted_role);
CREATE INDEX idx_role_grants_active ON public.role_grants(is_active) WHERE is_active = true;
CREATE INDEX idx_role_grants_expires_at ON public.role_grants(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_role_grants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_role_grants_updated_at
BEFORE UPDATE ON public.role_grants
FOR EACH ROW
EXECUTE FUNCTION public.update_role_grants_updated_at();

-- Create RPC function to grant roles
CREATE OR REPLACE FUNCTION public.grant_user_role(
  target_user_id UUID,
  role_to_grant TEXT,
  grant_context JSONB DEFAULT '{}',
  expires_at_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  granter_profile public.profiles%ROWTYPE;
  result JSONB;
BEGIN
  -- Get the granter's profile
  SELECT * INTO granter_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Check if granter has permission
  IF granter_profile.role != 'master_admin' AND 
     (granter_profile.role != 'admin' OR role_to_grant IN ('admin', 'master_admin')) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Revoke any existing active grants for this role
  UPDATE public.role_grants 
  SET is_active = false, 
      revoked_at = now(), 
      revoked_by = auth.uid()
  WHERE user_id = target_user_id 
    AND granted_role = role_to_grant 
    AND is_active = true;
  
  -- Insert new grant
  INSERT INTO public.role_grants (
    user_id, 
    granted_role, 
    granted_by, 
    context, 
    expires_at
  ) VALUES (
    target_user_id, 
    role_to_grant, 
    auth.uid(), 
    grant_context, 
    expires_at_param
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Role granted successfully');
END;
$$;

-- Create RPC function to revoke roles
CREATE OR REPLACE FUNCTION public.revoke_user_role(
  target_user_id UUID,
  role_to_revoke TEXT,
  revoke_context JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  granter_profile public.profiles%ROWTYPE;
BEGIN
  -- Get the revoker's profile
  SELECT * INTO granter_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Check if revoker has permission
  IF granter_profile.role != 'master_admin' AND 
     (granter_profile.role != 'admin' OR role_to_revoke IN ('admin', 'master_admin')) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;
  
  -- Revoke the role
  UPDATE public.role_grants 
  SET is_active = false, 
      revoked_at = now(), 
      revoked_by = auth.uid()
  WHERE user_id = target_user_id 
    AND granted_role = role_to_revoke 
    AND is_active = true;
  
  RETURN jsonb_build_object('success', true, 'message', 'Role revoked successfully');
END;
$$;

-- Create function to get user's effective roles
CREATE OR REPLACE FUNCTION public.get_user_effective_roles(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_role TEXT;
  granted_roles TEXT[];
  result JSONB;
BEGIN
  -- Get base role from profiles
  SELECT role INTO base_role 
  FROM public.profiles 
  WHERE user_id = target_user_id;
  
  -- Get active granted roles
  SELECT ARRAY_AGG(granted_role) INTO granted_roles
  FROM public.role_grants 
  WHERE user_id = target_user_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now());
  
  -- Build result
  result := jsonb_build_object(
    'base_role', COALESCE(base_role, 'guest'),
    'granted_roles', COALESCE(granted_roles, ARRAY[]::TEXT[]),
    'all_roles', ARRAY[COALESCE(base_role, 'guest')] || COALESCE(granted_roles, ARRAY[]::TEXT[])
  );
  
  RETURN result;
END;
$$;