-- Add budget management fields to company_profiles
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS daily_budget DECIMAL(10,2) DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS current_budget DECIMAL(10,2) DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(10,2) DEFAULT 30000.00,
ADD COLUMN IF NOT EXISTS auto_accept_leads BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS lead_cost_per_unit DECIMAL(10,2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS budget_alerts_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS low_budget_threshold DECIMAL(10,2) DEFAULT 100.00;

-- Create budget transactions table
CREATE TABLE IF NOT EXISTS public.company_budget_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on budget transactions
ALTER TABLE public.company_budget_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget transactions
CREATE POLICY "Companies can view their own budget transactions"
ON public.company_budget_transactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND up.company_id = company_budget_transactions.company_id
    )
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Admins can manage budget transactions"
ON public.company_budget_transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Create function to process lead assignment with budget
CREATE OR REPLACE FUNCTION public.assign_lead_with_budget(
    p_lead_id UUID,
    p_company_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company public.company_profiles%ROWTYPE;
    v_lead public.leads%ROWTYPE;
    v_cost DECIMAL(10,2);
    v_result JSONB;
BEGIN
    -- Lock the company row
    SELECT * INTO v_company
    FROM public.company_profiles
    WHERE id = p_company_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Company not found');
    END IF;
    
    -- Lock the lead row
    SELECT * INTO v_lead
    FROM public.leads
    WHERE id = p_lead_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
    END IF;
    
    -- Check if lead is already assigned
    IF v_lead.company_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead already assigned');
    END IF;
    
    -- Calculate cost
    v_cost := COALESCE(v_company.lead_cost_per_unit, 500.00);
    
    -- Check budget availability
    IF v_company.current_budget < v_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient budget');
    END IF;
    
    -- Assign lead
    UPDATE public.leads
    SET company_id = p_company_id,
        status = 'qualified',
        updated_at = NOW()
    WHERE id = p_lead_id;
    
    -- Deduct budget
    UPDATE public.company_profiles
    SET current_budget = current_budget - v_cost,
        updated_at = NOW()
    WHERE id = p_company_id;
    
    -- Record transaction
    INSERT INTO public.company_budget_transactions (
        company_id, lead_id, transaction_type, amount, 
        balance_before, balance_after, description
    ) VALUES (
        p_company_id, p_lead_id, 'debit', v_cost,
        v_company.current_budget, v_company.current_budget - v_cost,
        'Lead assignment: ' || v_lead.title
    );
    
    -- Log assignment in lead history
    INSERT INTO public.lead_history (
        lead_id, assigned_to, method, previous_status, new_status, metadata
    ) VALUES (
        p_lead_id, p_company_id, 'budget_auto', v_lead.status, 'qualified',
        jsonb_build_object(
            'cost', v_cost,
            'company_budget_after', v_company.current_budget - v_cost
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'assigned_to', p_company_id,
        'cost', v_cost,
        'remaining_budget', v_company.current_budget - v_cost
    );
END;
$$;

-- Enhanced distribution function with budget management
CREATE OR REPLACE FUNCTION public.distribute_new_lead_v3(lead_id_param uuid)
RETURNS TABLE(company_id uuid, assignment_cost numeric, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_record public.leads%ROWTYPE;
  company_record public.company_profiles%ROWTYPE;
  v_result JSONB;
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
      AND cp.tags IS NOT NULL
      AND lead_record.category = ANY(cp.tags)
      AND cp.current_budget >= COALESCE(cp.lead_cost_per_unit, 500.00)
      AND cp.auto_accept_leads = true
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
$$;