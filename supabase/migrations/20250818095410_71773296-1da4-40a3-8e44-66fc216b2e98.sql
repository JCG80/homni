-- Phase 1 (retry): Clean up pipeline_stage enum and update existing data safely

-- 1) Normalize lead_assignments.pipeline_stage using text comparisons to avoid enum input errors
UPDATE lead_assignments 
SET pipeline_stage = CASE 
  WHEN pipeline_stage::text = '📥 new' THEN 'new'
  WHEN pipeline_stage::text = '👀 qualified' THEN 'in_progress'
  WHEN pipeline_stage::text = '💬 contacted' THEN 'in_progress' 
  WHEN pipeline_stage::text = '📞 negotiating' THEN 'in_progress'
  WHEN pipeline_stage::text = '✅ converted' THEN 'won'
  WHEN pipeline_stage::text = '❌ lost' THEN 'lost'
  WHEN pipeline_stage::text = '⏸️ paused' THEN 'in_progress'
  ELSE pipeline_stage::text
END::pipeline_stage
WHERE pipeline_stage::text IN ('📥 new','👀 qualified','💬 contacted','📞 negotiating','✅ converted','❌ lost','⏸️ paused');

-- 2) Normalize leads.status to slug values
UPDATE leads 
SET status = CASE 
  WHEN status = '📥 new' THEN 'new'
  WHEN status = '👀 qualified' THEN 'qualified'
  WHEN status = '💬 contacted' THEN 'contacted'
  WHEN status = '📞 negotiating' THEN 'negotiating'
  WHEN status = '✅ converted' THEN 'converted'
  WHEN status = '❌ lost' THEN 'lost'
  WHEN status = '⏸️ paused' THEN 'paused'
  ELSE status
END
WHERE status LIKE '%📥%' OR status LIKE '%👀%' OR status LIKE '%💬%' OR status LIKE '%📞%' OR status LIKE '%✅%' OR status LIKE '%❌%' OR status LIKE '%⏸%';

-- 3) Create new clean pipeline_stage enum (slug-only)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_stage_new') THEN
    CREATE TYPE pipeline_stage_new AS ENUM ('new', 'in_progress', 'won', 'lost');
  END IF;
END $$;

-- 4) Alter lead_assignments.pipeline_stage to new enum using robust mapping
ALTER TABLE lead_assignments 
  ALTER COLUMN pipeline_stage DROP DEFAULT,
  ALTER COLUMN pipeline_stage TYPE pipeline_stage_new 
  USING (
    CASE 
      WHEN pipeline_stage::text = 'new' THEN 'new'::pipeline_stage_new
      WHEN pipeline_stage::text IN ('👀 qualified','qualified','💬 contacted','contacted','📞 negotiating','negotiating','⏸️ paused','paused','in_progress') THEN 'in_progress'::pipeline_stage_new
      WHEN pipeline_stage::text IN ('✅ converted','converted','won') THEN 'won'::pipeline_stage_new
      WHEN pipeline_stage::text IN ('❌ lost','lost') THEN 'lost'::pipeline_stage_new
      ELSE 'new'::pipeline_stage_new
    END
  ),
  ALTER COLUMN pipeline_stage SET DEFAULT 'new'::pipeline_stage_new;

-- 5) Replace the old enum with the new one
DO $$ BEGIN
  -- Ensure old type exists before dropping
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_stage') THEN
    DROP TYPE pipeline_stage;
  END IF;
END $$;

ALTER TYPE pipeline_stage_new RENAME TO pipeline_stage;

-- 6) Recreate dependent functions to ensure slug-only usage
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