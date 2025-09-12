-- Fix remaining functions without proper search_path

-- Fix remaining function search path issues
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id uuid)
RETURNS integer AS $$
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
  WHERE user_id = _user_id
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_level integer)
RETURNS boolean AS $$
  SELECT public.get_user_role_level(_user_id) >= _min_level
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_admin_action(target_kind_param text, target_id_param uuid, action_param text, metadata_param jsonb DEFAULT '{}'::jsonb)
RETURNS uuid AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.distribute_new_lead_v2(lead_id_param uuid)
RETURNS TABLE(company_id uuid, assignment_cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_record public.leads%ROWTYPE;
  company_record public.company_profiles%ROWTYPE;
  v_cost numeric := 500; -- Default cost per lead
  company_budget numeric;
BEGIN
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

  -- Find companies that match the lead category and have budget
  FOR company_record IN 
    SELECT cp.* 
    FROM public.company_profiles cp
    WHERE cp.status = 'active'
      AND cp.metadata->>'categories' IS NOT NULL
      AND (cp.metadata->'categories')::jsonb ? lead_record.category
      AND COALESCE((cp.metadata->>'daily_budget')::numeric, 0) >= v_cost
    ORDER BY 
      CASE WHEN (cp.metadata->>'auto_accept')::boolean = true THEN 1 ELSE 2 END,
      cp.updated_at ASC
    LIMIT 1
  LOOP
    -- Get current daily budget usage
    SELECT COALESCE((company_record.metadata->>'daily_budget')::numeric, 0) INTO company_budget;
    
    -- Check if company has sufficient budget for today
    IF company_budget >= v_cost THEN
      -- Assign lead to this company
      UPDATE public.leads
      SET company_id = company_record.id, 
          status = 'qualified',
          updated_at = now()
      WHERE id = lead_id_param;

      -- Log the assignment
      INSERT INTO public.lead_history (
        lead_id, assigned_to, method, previous_status, new_status, metadata
      ) VALUES (
        lead_id_param, company_record.id, 'auto', 'new', 'qualified',
        jsonb_build_object(
          'cost', v_cost,
          'assignment_reason', 'category_match',
          'company_name', company_record.name,
          'auto_accepted', (company_record.metadata->>'auto_accept')::boolean
        )
      );

      company_id := company_record.id;
      assignment_cost := v_cost;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;

  -- No suitable company found
  RETURN;
END;
$$;

-- Fix distribute_new_lead function
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_id_param uuid)
RETURNS TABLE(buyer_id uuid, assignment_id uuid, cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_record public.leads%ROWTYPE;
  package_record public.lead_packages%ROWTYPE;
  buyer_record public.buyer_accounts%ROWTYPE;
  v_assignment_id uuid;
  v_cost numeric;
  buyer_current_spend numeric;
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
$$;