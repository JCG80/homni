-- Seed test companies with different categories and budgets
INSERT INTO company_profiles (
  name, status, industry, subscription_plan, modules_access, 
  contact_name, email, phone, tags, metadata
) VALUES 
  ('Nordic Bygg AS', 'active', 'construction', 'premium', ARRAY['leads', 'analytics'], 
   'Lars Andersen', 'lars@nordicbygg.no', '+47 90123456', ARRAY['bygg', 'renovation'], 
   '{"categories": ["bygg", "renovation"], "daily_budget": 5000, "auto_accept": true}'),
  
  ('Oslo Rørlegger Service', 'active', 'plumbing', 'professional', ARRAY['leads'], 
   'Kari Pedersen', 'kari@osloror.no', '+47 98765432', ARRAY['rørlegger', 'bad'], 
   '{"categories": ["rørlegger", "bad"], "daily_budget": 3000, "auto_accept": false}'),
   
  ('Elektro Nord', 'active', 'electrical', 'professional', ARRAY['leads', 'dashboard'], 
   'Erik Hansson', 'erik@elektronord.no', '+47 95555123', ARRAY['elektro', 'belysning'], 
   '{"categories": ["elektro", "belysning"], "daily_budget": 4000, "auto_accept": true}'),
   
  ('Malermeister Bergen', 'active', 'painting', 'basic', ARRAY['leads'], 
   'Astrid Olsen', 'astrid@malerbergen.no', '+47 92333987', ARRAY['maling', 'dekorasjon'], 
   '{"categories": ["maling", "dekorasjon"], "daily_budget": 2000, "auto_accept": false}'),
   
  ('Totalentreprenør Vest AS', 'active', 'construction', 'premium', ARRAY['leads', 'analytics', 'dashboard'], 
   'Bjørn Kristiansen', 'bjorn@totalvest.no', '+47 97888444', ARRAY['totalentreprise', 'nybygg'], 
   '{"categories": ["totalentreprise", "nybygg", "tilbygg"], "daily_budget": 8000, "auto_accept": true}');

-- Update the distribute_new_lead function to work with company_profiles
CREATE OR REPLACE FUNCTION public.distribute_new_lead_v2(lead_id_param uuid)
RETURNS TABLE(company_id uuid, assignment_cost numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;