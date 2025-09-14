-- Secure RPC functions for role management with 2FA/OTP
-- migrations/20250115_secure_role_rpcs.sql

-- Helper functions first
CREATE OR REPLACE FUNCTION public.enhanced_is_master_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = COALESCE(_uid, auth.uid()) 
    AND role = 'master_admin'
    AND (expires_at IS NULL OR expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.enhanced_is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = COALESCE(_uid, auth.uid()) 
    AND role IN ('admin', 'master_admin')
    AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- SoD (Segregation of Duties) check
CREATE OR REPLACE FUNCTION public.check_sod_conflicts(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Returns true if conflict exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.sod_conflicts s ON (
      (s.role_a = ur.role AND s.role_b = _role) OR
      (s.role_b = ur.role AND s.role_a = _role)
    )
    WHERE ur.user_id = _user_id
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Audit lock check
CREATE OR REPLACE FUNCTION public.ensure_not_locked()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  locked boolean;
BEGIN
  SELECT is_locked INTO locked FROM public.audit_locks WHERE id = true;
  IF COALESCE(locked, false) THEN
    RAISE EXCEPTION 'Role changes are currently locked due to audit mode';
  END IF;
END;
$$;

-- 1) Initialize admin action challenge (generates OTP)
CREATE OR REPLACE FUNCTION public.init_admin_action_challenge(
  _action text,
  _payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_id uuid := gen_random_uuid();
  otp_code text;
BEGIN
  -- Only master_admin can initiate challenges
  IF NOT public.enhanced_is_master_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only master administrators can initiate critical actions';
  END IF;

  -- Check audit lock
  PERFORM public.ensure_not_locked();

  -- Generate 6-digit OTP
  otp_code := lpad(floor(random() * 1000000)::int::text, 6, '0');

  -- Store challenge
  INSERT INTO public.admin_action_challenges (
    id, admin_id, action, payload, otp_code, expires_at
  ) VALUES (
    challenge_id,
    auth.uid(),
    _action,
    _payload,
    otp_code, -- In production, this should be hashed
    now() + interval '10 minutes'
  );

  -- Log challenge creation
  INSERT INTO public.role_audit_log (
    actor, action, old_values, new_values
  ) VALUES (
    auth.uid(),
    'init_challenge',
    null,
    jsonb_build_object(
      'challenge_id', challenge_id,
      'action', _action,
      'expires_at', now() + interval '10 minutes'
    )
  );

  -- TODO: Send OTP via email/SMS (Edge Function integration)
  -- For now, we log it for development
  RAISE NOTICE 'OTP Code for challenge %: %', challenge_id, otp_code;

  RETURN challenge_id;
END;
$$;

-- 2) Verify OTP and execute action atomically
CREATE OR REPLACE FUNCTION public.verify_and_execute_admin_action(
  _challenge_id uuid,
  _otp_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_rec record;
  result_data jsonb := '{}';
BEGIN
  -- Get and validate challenge
  SELECT * INTO challenge_rec
  FROM public.admin_action_challenges
  WHERE id = _challenge_id
    AND admin_id = auth.uid()
    AND consumed_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, expired, or already consumed challenge';
  END IF;

  -- Verify OTP (in production, compare hashed values)
  IF challenge_rec.otp_code != _otp_code THEN
    RAISE EXCEPTION 'Invalid OTP code';
  END IF;

  -- Final security checks
  PERFORM public.ensure_not_locked();
  IF NOT public.enhanced_is_master_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Execute based on action type
  CASE challenge_rec.action
    WHEN 'grant_role' THEN
      PERFORM public._execute_grant_role(
        (challenge_rec.payload->>'user_id')::uuid,
        challenge_rec.payload->>'role',
        challenge_rec.payload->>'scope_key',
        challenge_rec.payload->>'expires_at'
      );
      result_data := jsonb_build_object('granted', true);

    WHEN 'revoke_role' THEN
      PERFORM public._execute_revoke_role(
        (challenge_rec.payload->>'user_id')::uuid,
        challenge_rec.payload->>'role',
        challenge_rec.payload->>'scope_key'
      );
      result_data := jsonb_build_object('revoked', true);

    WHEN 'batch_grant' THEN
      PERFORM public._execute_batch_grant(challenge_rec.payload);
      result_data := jsonb_build_object('batch_processed', true);

    WHEN 'approve_request' THEN
      PERFORM public._execute_approve_request(
        (challenge_rec.payload->>'request_id')::uuid,
        (challenge_rec.payload->>'approved')::boolean,
        challenge_rec.payload->>'reason'
      );
      result_data := jsonb_build_object('request_processed', true);

    ELSE
      RAISE EXCEPTION 'Unknown action: %', challenge_rec.action;
  END CASE;

  -- Mark challenge as consumed
  UPDATE public.admin_action_challenges
  SET consumed_at = now()
  WHERE id = _challenge_id;

  -- Final audit log
  INSERT INTO public.role_audit_log (
    actor, action, old_values, new_values
  ) VALUES (
    auth.uid(),
    'verify_and_execute',
    jsonb_build_object('challenge_id', _challenge_id),
    jsonb_build_object(
      'action', challenge_rec.action,
      'payload', challenge_rec.payload,
      'result', result_data
    )
  );

  RETURN result_data;
END;
$$;

-- 3) Internal execution functions
CREATE OR REPLACE FUNCTION public._execute_grant_role(
  _user_id uuid,
  _role text,
  _scope_key text,
  _expires_at text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expires_ts timestamptz;
  old_record record;
BEGIN
  -- Check SoD conflicts
  IF public.check_sod_conflicts(_user_id, _role) THEN
    RAISE EXCEPTION 'Segregation of duties conflict detected for user % and role %', _user_id, _role;
  END IF;

  -- Parse expiration
  IF _expires_at IS NOT NULL AND _expires_at != '' THEN
    expires_ts := _expires_at::timestamptz;
  END IF;

  -- Get old record for audit
  SELECT * INTO old_record
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(scope_key, '') = COALESCE(_scope_key, '');

  -- Upsert role
  INSERT INTO public.user_roles (
    user_id, role, scope_key, expires_at, granted_by, granted_at
  ) VALUES (
    _user_id, _role, _scope_key, expires_ts, auth.uid(), now()
  ) ON CONFLICT (user_id, role, COALESCE(scope_key, '')) DO UPDATE
  SET
    expires_at = EXCLUDED.expires_at,
    granted_by = EXCLUDED.granted_by,
    granted_at = EXCLUDED.granted_at;

  -- Audit log
  INSERT INTO public.role_audit_log (
    actor, action, target_user, role, scope_key, old_values, new_values
  ) VALUES (
    auth.uid(), 'grant_role', _user_id, _role, _scope_key,
    CASE WHEN old_record IS NOT NULL THEN to_jsonb(old_record) ELSE NULL END,
    jsonb_build_object(
      'user_id', _user_id,
      'role', _role,
      'scope_key', _scope_key,
      'expires_at', expires_ts,
      'granted_by', auth.uid()
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public._execute_revoke_role(
  _user_id uuid,
  _role text,
  _scope_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_record record;
BEGIN
  -- Get old record for audit
  SELECT * INTO old_record
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(scope_key, '') = COALESCE(_scope_key, '');

  IF old_record IS NULL THEN
    RAISE EXCEPTION 'Role not found for user';
  END IF;

  -- Delete role
  DELETE FROM public.user_roles
  WHERE user_id = _user_id
    AND role = _role
    AND COALESCE(scope_key, '') = COALESCE(_scope_key, '');

  -- Audit log
  INSERT INTO public.role_audit_log (
    actor, action, target_user, role, scope_key, old_values
  ) VALUES (
    auth.uid(), 'revoke_role', _user_id, _role, _scope_key, to_jsonb(old_record)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public._execute_batch_grant(
  _payload jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
BEGIN
  -- Process each item in the batch
  FOR item IN SELECT * FROM jsonb_array_elements(_payload->'items')
  LOOP
    PERFORM public._execute_grant_role(
      (item->>'user_id')::uuid,
      item->>'role',
      item->>'scope_key',
      item->>'expires_at'
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public._execute_approve_request(
  _request_id uuid,
  _approved boolean,
  _reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_rec record;
BEGIN
  -- Get request
  SELECT * INTO request_rec
  FROM public.role_requests
  WHERE id = _request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Update request status
  UPDATE public.role_requests
  SET
    status = CASE WHEN _approved THEN 'approved' ELSE 'rejected' END,
    decided_by = auth.uid(),
    decided_at = now(),
    decision_reason = _reason
  WHERE id = _request_id;

  -- If approved, grant the role
  IF _approved THEN
    PERFORM public._execute_grant_role(
      request_rec.requester,
      request_rec.role,
      request_rec.scope_key,
      NULL -- No expiration from request approval
    );
  END IF;

  -- Audit log
  INSERT INTO public.role_audit_log (
    actor, action, target_user, role, scope_key, old_values, new_values
  ) VALUES (
    auth.uid(), 'process_request', request_rec.requester, request_rec.role, request_rec.scope_key,
    to_jsonb(request_rec),
    jsonb_build_object('approved', _approved, 'reason', _reason)
  );
END;
$$;