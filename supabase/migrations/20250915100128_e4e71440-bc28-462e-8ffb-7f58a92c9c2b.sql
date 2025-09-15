-- Complete the rest of the role management functions

-- Enhanced grant_user_role function with enum support
CREATE OR REPLACE FUNCTION public.grant_user_role(
  _user_id UUID,
  _role public.app_role,
  _expires_date TEXT DEFAULT NULL,
  _scope TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expires_ts TIMESTAMPTZ;
BEGIN
  -- Check admin permissions (level 80+)
  IF NOT public.has_role_level(auth.uid(), 80) THEN
    RAISE EXCEPTION 'Not authorized to grant roles';
  END IF;

  -- Parse expiration date if provided
  IF _expires_date IS NOT NULL THEN
    expires_ts := (
      TO_TIMESTAMP(_expires_date || ' 23:59:59', 'YYYY-MM-DD HH24:MI:SS') 
      AT TIME ZONE 'UTC'
    );
  END IF;

  -- Insert or update role
  INSERT INTO public.user_roles (
    user_id, role, scope_key, expires_at, granted_by, is_active, revoked_at, revoked_by
  )
  VALUES (
    _user_id, _role, _scope, expires_ts, auth.uid(), TRUE, NULL, NULL
  )
  ON CONFLICT (user_id, role, COALESCE(scope_key, '')) 
  DO UPDATE SET
    expires_at = EXCLUDED.expires_at,
    granted_by = auth.uid(),
    granted_at = NOW(),
    is_active = TRUE,
    revoked_at = NULL,
    revoked_by = NULL;

  -- Log the action
  INSERT INTO public.role_audit_log (
    actor, action, target_user, role, scope_key, new_values
  )
  VALUES (
    auth.uid(), 
    'grant', 
    _user_id, 
    _role::TEXT, 
    _scope, 
    jsonb_build_object('expires_at', expires_ts)
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'user_id', _user_id,
    'role', _role,
    'scope_key', _scope,
    'expires_at', expires_ts
  );
END;
$$;

-- Revoke and grant permissions
REVOKE ALL ON FUNCTION public.grant_user_role(UUID, public.app_role, TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.grant_user_role(UUID, public.app_role, TEXT, TEXT) TO authenticated;

-- Enhanced revoke_user_role function
CREATE OR REPLACE FUNCTION public.revoke_user_role(
  _user_id UUID,
  _role public.app_role,
  _scope TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_rec public.user_roles%ROWTYPE;
BEGIN
  -- Check admin permissions (level 80+)
  IF NOT public.has_role_level(auth.uid(), 80) THEN
    RAISE EXCEPTION 'Not authorized to revoke roles';
  END IF;

  -- Get existing record for audit
  SELECT * INTO old_rec 
  FROM public.user_roles 
  WHERE user_id = _user_id 
    AND role = _role 
    AND COALESCE(scope_key, '') = COALESCE(_scope, '');

  -- Soft revoke (set is_active = false)
  UPDATE public.user_roles 
  SET 
    is_active = FALSE,
    revoked_at = NOW(),
    revoked_by = auth.uid()
  WHERE user_id = _user_id 
    AND role = _role 
    AND COALESCE(scope_key, '') = COALESCE(_scope, '');

  -- Log the action
  INSERT INTO public.role_audit_log (
    actor, action, target_user, role, scope_key, old_values, new_values
  )
  VALUES (
    auth.uid(), 
    'revoke', 
    _user_id, 
    _role::TEXT, 
    _scope,
    to_jsonb(old_rec),
    jsonb_build_object(
      'is_active', FALSE,
      'revoked_at', NOW(),
      'revoked_by', auth.uid()
    )
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'user_id', _user_id,
    'role', _role,
    'scope_key', _scope
  );
END;
$$;

-- Revoke and grant permissions
REVOKE ALL ON FUNCTION public.revoke_user_role(UUID, public.app_role, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(UUID, public.app_role, TEXT) TO authenticated;

-- Create security settings table for OTP bypass
CREATE TABLE IF NOT EXISTS public.security_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  otp_bypass_code TEXT,
  enforce_bypass_only_in_dev BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default security settings for development
INSERT INTO public.security_settings (id, otp_bypass_code, enforce_bypass_only_in_dev)
VALUES (TRUE, '000000', TRUE)
ON CONFLICT (id) DO UPDATE SET
  otp_bypass_code = EXCLUDED.otp_bypass_code,
  enforce_bypass_only_in_dev = EXCLUDED.enforce_bypass_only_in_dev;

-- OTP challenge initialization function
CREATE OR REPLACE FUNCTION public.init_admin_action_challenge(
  _action TEXT,
  _payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cid UUID := gen_random_uuid();
  otp TEXT := lpad((floor(random() * 1000000))::int::text, 6, '0');
BEGIN
  -- Check admin permissions (level 80+)
  IF NOT public.has_role_level(auth.uid(), 80) THEN
    RAISE EXCEPTION 'Not authorized to initiate challenges';
  END IF;

  -- Insert challenge record
  INSERT INTO public.admin_action_challenges (
    id, admin_id, action, payload, otp_code, expires_at
  )
  VALUES (
    cid, 
    auth.uid(), 
    _action, 
    _payload, 
    otp, 
    NOW() + INTERVAL '10 minutes'
  );

  -- Log challenge creation
  INSERT INTO public.role_audit_log (
    actor, action, new_values
  )
  VALUES (
    auth.uid(), 
    'init_challenge', 
    jsonb_build_object('challenge_id', cid, 'action', _action)
  );

  RETURN cid;
END;
$$;

-- Revoke and grant permissions
REVOKE ALL ON FUNCTION public.init_admin_action_challenge(TEXT, JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.init_admin_action_challenge(TEXT, JSONB) TO authenticated;

-- OTP verification and execution function
CREATE OR REPLACE FUNCTION public.verify_and_execute_admin_action(
  _challenge_id UUID,
  _otp_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
  bypass TEXT;
  bypass_only_dev BOOLEAN;
BEGIN
  -- Get challenge record
  SELECT * INTO rec 
  FROM public.admin_action_challenges
  WHERE id = _challenge_id 
    AND admin_id = auth.uid() 
    AND consumed_at IS NULL 
    AND expires_at > NOW();

  IF rec IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired challenge';
  END IF;

  -- Get bypass settings
  SELECT otp_bypass_code, enforce_bypass_only_in_dev 
  INTO bypass, bypass_only_dev
  FROM public.security_settings 
  WHERE id = TRUE;

  -- Verify OTP (allow bypass in development)
  IF NOT (
    rec.otp_code = _otp_code OR 
    (bypass IS NOT NULL AND 
     _otp_code = bypass AND 
     (bypass_only_dev IS FALSE OR current_setting('app.env', true) != 'prod'))
  ) THEN
    RAISE EXCEPTION 'Invalid OTP code';
  END IF;

  -- Execute action based on type
  IF rec.action = 'grant_role' THEN
    PERFORM public.grant_user_role(
      (rec.payload->>'user_id')::UUID,
      (rec.payload->>'role')::public.app_role,
      rec.payload->>'expires_date',
      rec.payload->>'scope_key'
    );
  ELSIF rec.action = 'revoke_role' THEN
    PERFORM public.revoke_user_role(
      (rec.payload->>'user_id')::UUID,
      (rec.payload->>'role')::public.app_role,
      rec.payload->>'scope_key'
    );
  ELSE
    RAISE EXCEPTION 'Unknown action: %', rec.action;
  END IF;

  -- Mark challenge as consumed
  UPDATE public.admin_action_challenges 
  SET consumed_at = NOW() 
  WHERE id = _challenge_id;

  -- Final audit log
  INSERT INTO public.role_audit_log (
    actor, action, new_values
  )
  VALUES (
    auth.uid(), 
    'verify_and_execute', 
    rec.payload
  );
END;
$$;

-- Revoke and grant permissions
REVOKE ALL ON FUNCTION public.verify_and_execute_admin_action(UUID, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_and_execute_admin_action(UUID, TEXT) TO authenticated;

-- Enable RLS on security_settings
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for security_settings (master_admin only)
CREATE POLICY "security_settings_master_admin_only" 
ON public.security_settings
FOR ALL 
USING (public.has_role_level(auth.uid(), 100));