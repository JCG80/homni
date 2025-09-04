-- Fix FK and improve lead distribution matching
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_schema = 'public'
      AND tc.table_name = 'leads'
      AND tc.constraint_name = 'leads_company_id_fkey'
  ) THEN
    ALTER TABLE public.leads DROP CONSTRAINT leads_company_id_fkey;
  END IF;
END $$;

-- Recreate FK to company_profiles(id)
ALTER TABLE public.leads
ADD CONSTRAINT leads_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES public.company_profiles(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);

-- Improved lead distribution with better category matching (case-insensitive + partial)
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

  v_category_lower := lower(lead_record.category);

  FOR company_record IN 
    SELECT cp.* 
    FROM public.company_profiles cp
    WHERE cp.status = 'active'
      AND cp.tags IS NOT NULL
      AND cp.current_budget >= COALESCE(cp.lead_cost_per_unit, 500.00)
      AND cp.auto_accept_leads = true
      AND (
        lead_record.category = ANY(cp.tags)
        OR v_category_lower = ANY(ARRAY(SELECT lower(unnest(cp.tags))))
        OR EXISTS (
          SELECT 1 FROM unnest(cp.tags) AS tag
          WHERE lower(tag) LIKE '%' || v_category_lower || '%'
             OR v_category_lower LIKE '%' || lower(tag) || '%'
        )
        OR (
          v_category_lower ~ '(elektr|rør|bygg|mal|tak|vvs|rørlegg|elektro)'
          AND EXISTS (
            SELECT 1 FROM unnest(cp.tags) AS tag
            WHERE lower(tag) ~ '(elektr|rør|bygg|mal|tak|vvs|rørlegg|elektro)'
          )
        )
      )
    ORDER BY cp.current_budget DESC, cp.updated_at ASC
    LIMIT 1
  LOOP
    SELECT public.assign_lead_with_budget(lead_id_param, company_record.id) INTO v_result;
    IF (v_result->>'success')::boolean THEN
      company_id := company_record.id;
      assignment_cost := (v_result->>'cost')::numeric;
      success := true;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;

  company_id := NULL;
  assignment_cost := 0;
  success := false;
  RETURN NEXT;
  RETURN;
END;
$function$;
