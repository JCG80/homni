
-- 1) Indexes for performance (safe, non-unique)
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads (company_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead_buyer ON public.lead_assignments (lead_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_spend_ledger_buyer_date ON public.buyer_spend_ledger (buyer_id, created_at DESC);

-- 2) Transaction-safe distribute_new_lead with advisory locks and row locks
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_id_param uuid)
RETURNS TABLE(buyer_id uuid, assignment_id uuid, cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 3) Transaction-safe execute_auto_purchase with advisory lock and row locks
CREATE OR REPLACE FUNCTION public.execute_auto_purchase(p_lead_id uuid, p_buyer_id uuid, p_package_id uuid, p_cost numeric)
RETURNS TABLE(assignment_id uuid, buyer_id uuid, cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_assignment_id uuid;
  v_current_budget numeric;
  v_lead public.leads%ROWTYPE;
BEGIN
  -- Serialize on (lead,buyer) pair
  PERFORM pg_advisory_xact_lock(hashtextextended((p_lead_id::text || '|' || p_buyer_id::text), 0));

  -- Lock lead row
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', p_lead_id;
  END IF;

  -- Lock buyer row
  PERFORM 1 FROM public.buyer_accounts WHERE id = p_buyer_id FOR UPDATE;

  -- Prevent duplicate assignment to same buyer
  SELECT id INTO v_assignment_id 
  FROM public.lead_assignments 
  WHERE lead_id = p_lead_id AND buyer_id = p_buyer_id
  LIMIT 1;

  IF v_assignment_id IS NOT NULL THEN
    RAISE EXCEPTION 'Assignment already exists for this lead and buyer';
  END IF;

  -- Budget check after lock
  SELECT current_budget INTO v_current_budget FROM public.buyer_accounts WHERE id = p_buyer_id;
  IF v_current_budget IS NULL OR v_current_budget < p_cost THEN
    RAISE EXCEPTION 'Insufficient budget';
  END IF;

  -- Create assignment
  INSERT INTO public.lead_assignments (lead_id, buyer_id, cost, assigned_at, auto_purchased_at, pipeline_stage)
  VALUES (p_lead_id, p_buyer_id, p_cost, now(), now(), 'new'::pipeline_stage)
  RETURNING id INTO v_assignment_id;

  -- Deduct budget
  UPDATE public.buyer_accounts 
  SET current_budget = current_budget - p_cost, updated_at = now() 
  WHERE id = p_buyer_id;

  -- Ledger entry
  INSERT INTO public.buyer_spend_ledger (buyer_id, assignment_id, amount, balance_after, transaction_type, description)
  VALUES (p_buyer_id, v_assignment_id, -p_cost, v_current_budget - p_cost, 'lead_purchase', 'Auto-purchase of lead ' || p_lead_id::text);

  RETURN QUERY SELECT v_assignment_id, p_buyer_id, p_cost;
END;
$function$;
