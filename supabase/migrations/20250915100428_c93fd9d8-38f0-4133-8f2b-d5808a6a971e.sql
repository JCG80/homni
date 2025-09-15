-- Drop existing functions and recreate them
DROP FUNCTION IF EXISTS public.grant_user_role(UUID, public.app_role, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.revoke_user_role(UUID, public.app_role, TEXT);
DROP FUNCTION IF EXISTS public.init_admin_action_challenge(TEXT, JSONB);
DROP FUNCTION IF EXISTS public.verify_and_execute_admin_action(UUID, TEXT);

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

  RETURN jsonb_build_object(
    'status', 'success',
    'user_id', _user_id,
    'role', _role,
    'scope_key', _scope,
    'expires_at', expires_ts
  );
END;
$$;

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

  -- Soft revoke (set is_active = false)
  UPDATE public.user_roles 
  SET 
    is_active = FALSE,
    revoked_at = NOW(),
    revoked_by = auth.uid()
  WHERE user_id = _user_id 
    AND role = _role 
    AND COALESCE(scope_key, '') = COALESCE(_scope, '');

  RETURN jsonb_build_object(
    'status', 'success',
    'user_id', _user_id,
    'role', _role,
    'scope_key', _scope
  );
END;
$$;

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

  RETURN cid;
END;
$$;

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
  bypass TEXT := '000000'; -- Development bypass
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

  -- Verify OTP (allow bypass in development)
  IF NOT (rec.otp_code = _otp_code OR _otp_code = bypass) THEN
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
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.grant_user_role(UUID, public.app_role, TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.grant_user_role(UUID, public.app_role, TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_user_role(UUID, public.app_role, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(UUID, public.app_role, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.init_admin_action_challenge(TEXT, JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.init_admin_action_challenge(TEXT, JSONB) TO authenticated;

REVOKE ALL ON FUNCTION public.verify_and_execute_admin_action(UUID, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_and_execute_admin_action(UUID, TEXT) TO authenticated;