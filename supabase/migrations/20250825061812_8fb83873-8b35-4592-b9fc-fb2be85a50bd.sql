-- Fix database functions to include SET search_path = public
-- Update distribute_new_lead function
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_id_param uuid)
 RETURNS TABLE(buyer_id uuid, assignment_id uuid, cost numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  lead_record leads%ROWTYPE;
  package_record lead_packages%ROWTYPE;
  buyer_record buyer_accounts%ROWTYPE;
  assignment_record RECORD;
  buyer_current_spend NUMERIC;
BEGIN
  SELECT * INTO lead_record FROM public.leads WHERE id = lead_id_param;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lead not found: %', lead_id_param; END IF;

  FOR package_record IN 
    SELECT * FROM public.lead_packages WHERE is_active = true ORDER BY priority_level DESC
  LOOP
    FOR buyer_record IN
      SELECT ba.* FROM public.buyer_accounts ba
      INNER JOIN public.buyer_package_subscriptions bps ON ba.id = bps.buyer_id
      WHERE bps.package_id = package_record.id
        AND bps.status = 'active'
        AND ba.current_budget >= package_record.price_per_lead
        AND NOT ba.pause_when_budget_exceeded
    LOOP
      SELECT COALESCE(SUM(amount), 0) INTO buyer_current_spend
      FROM public.buyer_spend_ledger
      WHERE buyer_id = buyer_record.id AND DATE(created_at) = CURRENT_DATE;

      IF (buyer_record.daily_budget IS NULL OR buyer_current_spend + package_record.price_per_lead <= buyer_record.daily_budget) THEN
        INSERT INTO public.lead_assignments (lead_id, buyer_id, cost, pipeline_stage, status)
        VALUES (lead_id_param, buyer_record.id, package_record.price_per_lead, 'new'::pipeline_stage, 'assigned')
        RETURNING * INTO assignment_record;

        INSERT INTO public.buyer_spend_ledger (
          buyer_id, assignment_id, amount, balance_after, transaction_type, description
        ) VALUES (
          buyer_record.id,
          assignment_record.id,
          -package_record.price_per_lead,
          buyer_record.current_budget - package_record.price_per_lead,
          'lead_purchase',
          format('Lead purchase: %s', lead_record.title)
        );

        UPDATE public.buyer_accounts 
        SET current_budget = current_budget - package_record.price_per_lead
        WHERE id = buyer_record.id;

        UPDATE public.leads SET company_id = buyer_record.id::text::uuid WHERE id = lead_id_param;

        RETURN QUERY SELECT buyer_record.id, assignment_record.id, package_record.price_per_lead; RETURN;
      END IF;
    END LOOP;
  END LOOP;
  RETURN;
END;
$function$;

-- Update execute_auto_purchase function
CREATE OR REPLACE FUNCTION public.execute_auto_purchase(p_lead_id uuid, p_buyer_id uuid, p_package_id uuid, p_cost numeric)
 RETURNS TABLE(assignment_id uuid, buyer_id uuid, cost numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_assignment_id UUID;
  v_current_budget NUMERIC;
BEGIN
  SELECT id INTO v_assignment_id FROM lead_assignments WHERE lead_id = p_lead_id AND buyer_id = p_buyer_id;
  IF v_assignment_id IS NOT NULL THEN RAISE EXCEPTION 'Assignment already exists for this lead and buyer'; END IF;

  SELECT current_budget INTO v_current_budget FROM buyer_accounts WHERE id = p_buyer_id;
  IF v_current_budget IS NULL OR v_current_budget < p_cost THEN RAISE EXCEPTION 'Insufficient budget'; END IF;

  INSERT INTO lead_assignments (lead_id, buyer_id, cost, assigned_at, auto_purchased_at, pipeline_stage)
  VALUES (p_lead_id, p_buyer_id, p_cost, now(), now(), 'new'::pipeline_stage)
  RETURNING id INTO v_assignment_id;

  UPDATE buyer_accounts SET current_budget = current_budget - p_cost, updated_at = now() WHERE id = p_buyer_id;

  INSERT INTO buyer_spend_ledger (buyer_id, assignment_id, amount, balance_after, transaction_type, description)
  VALUES (p_buyer_id, v_assignment_id, -p_cost, v_current_budget - p_cost, 'lead_purchase', 'Auto-purchase of lead ' || p_lead_id::text);

  RETURN QUERY SELECT v_assignment_id, p_buyer_id, p_cost;
END;
$function$;