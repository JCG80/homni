-- Fix remaining functions without proper search_path
-- Continue fixing SECURITY DEFINER functions

-- Fix remaining distribution and admin functions
CREATE OR REPLACE FUNCTION public.log_admin_action(p_action text, p_target_type text, p_target_id UUID DEFAULT NULL, p_old_values jsonb DEFAULT NULL, p_new_values jsonb DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_type,
    target_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix get_user_role_level function
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(
    CASE 
      WHEN role = 'master_admin' THEN 100
      WHEN role = 'admin' THEN 80
      WHEN role = 'content_editor' THEN 60
      WHEN role = 'company' THEN 40
      WHEN role = 'user' THEN 20
      WHEN role = 'guest' THEN 0
      ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix has_role_level function
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id UUID, _min_level INTEGER)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix distribute_new_lead function
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_id_param UUID)
RETURNS TABLE(buyer_id UUID, assignment_id UUID, cost NUMERIC) AS $$
DECLARE
  lead_record public.leads%ROWTYPE;
  package_record public.lead_packages%ROWTYPE;
  buyer_record public.buyer_accounts%ROWTYPE;
  v_assignment_id UUID;
  v_cost NUMERIC;
  buyer_current_spend NUMERIC;
BEGIN
  -- Serialize distribution attempts for this lead
  PERFORM pg_advisory_xact_lock(hashtextextended(lead_id_param::text, 0));

  -- Lock the lead row
  SELECT * INTO lead_record
  FROM public.leads
  WHERE id = lead_id_param
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', lead_id_param;
  END IF;

  -- If lead already assigned, stop
  IF lead_record.company_id IS NOT NULL THEN
    RAISE EXCEPTION 'Lead % already assigned', lead_id_param;
  END IF;

  -- Iterate by package priority
  FOR package_record IN 
    SELECT * FROM public.lead_packages WHERE is_active = true ORDER BY priority_level DESC
  LOOP
    -- Eligible buyers under this package
    FOR buyer_record IN
      SELECT ba.* 
      FROM public.buyer_accounts ba
      JOIN public.buyer_package_subscriptions bps ON ba.id = bps.buyer_id
      WHERE bps.package_id = package_record.id
        AND bps.status = 'active'
        AND ba.current_budget >= package_record.price_per_lead
        AND NOT ba.pause_when_budget_exceeded
    LOOP
      -- Lock this buyer row to prevent concurrent budget changes
      PERFORM 1 FROM public.buyer_accounts WHERE id = buyer_record.id FOR UPDATE;

      -- Avoid duplicate assignment for same (lead, buyer)
      IF EXISTS (
        SELECT 1 FROM public.lead_assignments 
        WHERE lead_id = lead_id_param AND buyer_id = buyer_record.id
      ) THEN
        CONTINUE;
      END IF;

      -- Calculate today's spend (best-effort; buyer row is locked)
      SELECT COALESCE(SUM(amount), 0) INTO buyer_current_spend
      FROM public.buyer_spend_ledger
      WHERE buyer_id = buyer_record.id
        AND DATE(created_at) = CURRENT_DATE;

      IF buyer_record.daily_budget IS NULL 
         OR buyer_current_spend + package_record.price_per_lead <= buyer_record.daily_budget THEN
        -- Create assignment
        INSERT INTO public.lead_assignments (lead_id, buyer_id, cost, pipeline_stage, status)
        VALUES (lead_id_param, buyer_record.id, package_record.price_per_lead, 'new'::pipeline_stage, 'assigned')
        RETURNING id, cost INTO v_assignment_id, v_cost;

        -- Ledger entry
        INSERT INTO public.buyer_spend_ledger (
          buyer_id, assignment_id, amount, balance_after, transaction_type, description
        )
        VALUES (
          buyer_record.id,
          v_assignment_id,
          -v_cost,
          buyer_record.current_budget - v_cost,
          'lead_purchase',
          format('Lead purchase: %s', lead_record.title)
        );

        -- Decrement budget
        UPDATE public.buyer_accounts
        SET current_budget = current_budget - v_cost, updated_at = now()
        WHERE id = buyer_record.id;

        -- Mark lead as assigned to this company/buyer
        UPDATE public.leads
        SET company_id = buyer_record.id::text::uuid, updated_at = now()
        WHERE id = lead_id_param;

        buyer_id := buyer_record.id;
        assignment_id := v_assignment_id;
        cost := v_cost;
        RETURN NEXT;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix has_role_grant function
CREATE OR REPLACE FUNCTION public.has_role_grant(_role app_role, _user_id UUID DEFAULT auth.uid(), _context text DEFAULT NULL)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_grants rg
    WHERE rg.user_id = COALESCE(_user_id, auth.uid())
      AND rg.role = _role
      AND rg.is_active = true
      AND rg.revoked_at IS NULL
      AND (rg.expires_at IS NULL OR rg.expires_at > now())
      AND (_context IS NULL OR rg.context = _context)
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Fix grant_role function
CREATE OR REPLACE FUNCTION public.grant_role(_user_id UUID, _role app_role, _context text DEFAULT NULL, _expires_at timestamp with time zone DEFAULT NULL)
RETURNS role_grants AS $$
DECLARE
  v_row public.role_grants;
BEGIN
  -- Check permissions
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'master_admin'::app_role)) THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;