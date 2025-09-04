-- Improved lead distribution with better category matching
CREATE OR REPLACE FUNCTION public.distribute_new_lead_v3(lead_id_param uuid)
RETURNS TABLE(company_id uuid, assignment_cost numeric, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_record public.leads%ROWTYPE;
  company_record public.company_profiles%ROWTYPE;
  v_result JSONB;
  v_category_lower TEXT;
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

  -- Convert lead category to lowercase for better matching
  v_category_lower := lower(lead_record.category);

  -- Find companies with flexible category matching and budget
  FOR company_record IN 
    SELECT cp.* 
    FROM public.company_profiles cp
    WHERE cp.status = 'active'
      AND cp.tags IS NOT NULL
      AND cp.current_budget >= COALESCE(cp.lead_cost_per_unit, 500.00)
      AND cp.auto_accept_leads = true
      AND (
        -- Exact match
        lead_record.category = ANY(cp.tags)
        OR
        -- Lowercase match
        v_category_lower = ANY(ARRAY(SELECT lower(unnest(cp.tags))))
        OR  
        -- Partial match for common Norwegian categories
        (v_category_lower LIKE '%elektr%' AND EXISTS(SELECT 1 FROM unnest(cp.tags) AS tag WHERE lower(tag) LIKE '%elektr%'))
        OR
        (v_category_lower LIKE '%rør%' AND EXISTS(SELECT 1 FROM unnest(cp.tags) AS tag WHERE lower(tag) LIKE '%rør%'))
        OR
        (v_category_lower LIKE '%bygg%' AND EXISTS(SELECT 1 FROM unnest(cp.tags) AS tag WHERE lower(tag) LIKE '%bygg%'))
        OR
        (v_category_lower LIKE '%mal%' AND EXISTS(SELECT 1 FROM unnest(cp.tags) AS tag WHERE lower(tag) LIKE '%mal%'))
        OR
        (v_category_lower LIKE '%tak%' AND EXISTS(SELECT 1 FROM unnest(cp.tags) AS tag WHERE lower(tag) LIKE '%tak%'))
      )
    ORDER BY 
      cp.current_budget DESC, -- Prefer companies with higher budget
      cp.updated_at ASC
    LIMIT 1
  LOOP
    -- Attempt assignment with budget check
    SELECT public.assign_lead_with_budget(lead_id_param, company_record.id) INTO v_result;
    
    IF (v_result->>'success')::boolean THEN
      company_id := company_record.id;
      assignment_cost := (v_result->>'cost')::numeric;
      success := true;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;

  -- No suitable company found
  company_id := NULL;
  assignment_cost := 0;
  success := false;
  RETURN NEXT;
  RETURN;
END;
$function$;

-- Test the improved function with an existing lead
SELECT * FROM public.distribute_new_lead_v3('dacb205e-2f4f-49bd-a2af-4891bd428a99'::uuid);