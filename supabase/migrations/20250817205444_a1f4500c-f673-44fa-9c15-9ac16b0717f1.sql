-- Create pipeline_stage enum with canonical slugs
CREATE TYPE public.pipeline_stage AS ENUM ('new', 'in_progress', 'won', 'lost');

-- Update lead_assignments table to use new enum and map legacy values
ALTER TABLE public.lead_assignments 
ADD COLUMN new_pipeline_stage pipeline_stage DEFAULT 'new';

-- Map existing emoji values to canonical slugs
UPDATE public.lead_assignments 
SET new_pipeline_stage = CASE 
  WHEN pipeline_stage::text ~ '📥|new' THEN 'new'::pipeline_stage
  WHEN pipeline_stage::text ~ '🚀|qualified|contacted|negotiating|paused|in_progress' THEN 'in_progress'::pipeline_stage
  WHEN pipeline_stage::text ~ '🏆|✅|converted|won' THEN 'won'::pipeline_stage
  WHEN pipeline_stage::text ~ '❌|lost' THEN 'lost'::pipeline_stage
  ELSE 'new'::pipeline_stage
END;

-- Drop old column and rename new one
ALTER TABLE public.lead_assignments DROP COLUMN pipeline_stage;
ALTER TABLE public.lead_assignments RENAME COLUMN new_pipeline_stage TO pipeline_stage;

-- Make leads.submitted_by nullable for anonymous submissions
ALTER TABLE public.leads ALTER COLUMN submitted_by DROP NOT NULL;

-- Update any functions that were setting emoji values to use slugs
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_id_param uuid)
RETURNS TABLE(buyer_id uuid, assignment_id uuid, cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  lead_record leads%ROWTYPE;
  package_record lead_packages%ROWTYPE;
  buyer_record buyer_accounts%ROWTYPE;
  assignment_record RECORD;
  buyer_current_spend NUMERIC;
BEGIN
  -- Get the lead details
  SELECT * INTO lead_record FROM public.leads WHERE id = lead_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', lead_id_param;
  END IF;
  
  -- Find active packages that match the lead category
  FOR package_record IN 
    SELECT * FROM public.lead_packages 
    WHERE is_active = true 
    ORDER BY priority_level DESC
  LOOP
    -- Find buyers subscribed to this package with available budget
    FOR buyer_record IN
      SELECT ba.* FROM public.buyer_accounts ba
      INNER JOIN public.buyer_package_subscriptions bps ON ba.id = bps.buyer_id
      WHERE bps.package_id = package_record.id
        AND bps.status = 'active'
        AND ba.current_budget >= package_record.price_per_lead
        AND NOT ba.pause_when_budget_exceeded
    LOOP
      -- Check daily spending limits
      SELECT COALESCE(SUM(amount), 0) INTO buyer_current_spend
      FROM public.buyer_spend_ledger
      WHERE buyer_id = buyer_record.id
        AND DATE(created_at) = CURRENT_DATE;
      
      -- Check if buyer can afford this lead
      IF (buyer_record.daily_budget IS NULL OR buyer_current_spend + package_record.price_per_lead <= buyer_record.daily_budget) THEN
        -- Create assignment with canonical pipeline stage
        INSERT INTO public.lead_assignments (lead_id, buyer_id, cost, status, pipeline_stage)
        VALUES (lead_id_param, buyer_record.id, package_record.price_per_lead, 'assigned', 'new'::pipeline_stage)
        RETURNING * INTO assignment_record;
        
        -- Record spending
        INSERT INTO public.buyer_spend_ledger (
          buyer_id, 
          assignment_id, 
          amount, 
          balance_after, 
          transaction_type, 
          description
        ) VALUES (
          buyer_record.id,
          assignment_record.id,
          -package_record.price_per_lead,
          buyer_record.current_budget - package_record.price_per_lead,
          'lead_purchase',
          format('Lead purchase: %s', lead_record.title)
        );
        
        -- Update buyer budget
        UPDATE public.buyer_accounts 
        SET current_budget = current_budget - package_record.price_per_lead
        WHERE id = buyer_record.id;
        
        -- Update lead assignment
        UPDATE public.leads 
        SET company_id = buyer_record.id::text::uuid
        WHERE id = lead_id_param;
        
        -- Return assignment details
        RETURN QUERY SELECT buyer_record.id, assignment_record.id, package_record.price_per_lead;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;
  
  -- No suitable buyer found
  RETURN;
END;
$function$;

-- Update execute_auto_purchase function to use canonical pipeline stages
CREATE OR REPLACE FUNCTION public.execute_auto_purchase(p_lead_id uuid, p_buyer_id uuid, p_package_id uuid, p_cost numeric)
RETURNS TABLE(assignment_id uuid, buyer_id uuid, cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_assignment_id UUID;
  v_current_budget NUMERIC;
BEGIN
  -- Check if assignment already exists
  SELECT id INTO v_assignment_id
  FROM lead_assignments
  WHERE lead_id = p_lead_id AND buyer_id = p_buyer_id;
  
  IF v_assignment_id IS NOT NULL THEN
    RAISE EXCEPTION 'Assignment already exists for this lead and buyer';
  END IF;

  -- Get current budget
  SELECT current_budget INTO v_current_budget
  FROM buyer_accounts
  WHERE id = p_buyer_id;

  -- Check budget
  IF v_current_budget IS NULL OR v_current_budget < p_cost THEN
    RAISE EXCEPTION 'Insufficient budget';
  END IF;

  -- Create assignment with canonical pipeline stage
  INSERT INTO lead_assignments (
    lead_id,
    buyer_id,
    cost,
    assigned_at,
    auto_purchased_at,
    pipeline_stage
  ) VALUES (
    p_lead_id,
    p_buyer_id,
    p_cost,
    now(),
    now(),
    'new'::pipeline_stage
  ) RETURNING id INTO v_assignment_id;

  -- Update buyer budget
  UPDATE buyer_accounts
  SET current_budget = current_budget - p_cost,
      updated_at = now()
  WHERE id = p_buyer_id;

  -- Create spending ledger entry
  INSERT INTO buyer_spend_ledger (
    buyer_id,
    assignment_id,
    amount,
    balance_after,
    transaction_type,
    description
  ) VALUES (
    p_buyer_id,
    v_assignment_id,
    -p_cost,
    v_current_budget - p_cost,
    'lead_purchase',
    'Auto-purchase of lead ' || p_lead_id::text
  );

  -- Return result
  RETURN QUERY SELECT v_assignment_id, p_buyer_id, p_cost;
END;
$function$;