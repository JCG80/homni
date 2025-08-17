-- Add missing columns to buyer_package_subscriptions
ALTER TABLE buyer_package_subscriptions 
ADD COLUMN IF NOT EXISTS auto_buy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_cap_cents INTEGER,
ADD COLUMN IF NOT EXISTS monthly_cap_cents INTEGER;

-- Add missing columns to lead_assignments  
ALTER TABLE lead_assignments
ADD COLUMN IF NOT EXISTS auto_purchased_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create lead_assignment_history table
CREATE TABLE IF NOT EXISTS lead_assignment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES lead_assignments(id) ON DELETE CASCADE,
  previous_stage TEXT,
  new_stage TEXT,
  notes TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on lead_assignment_history
ALTER TABLE lead_assignment_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_assignment_history
CREATE POLICY "Admins manage assignment history" ON lead_assignment_history
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Buyers view assignment history" ON lead_assignment_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lead_assignments la
    JOIN user_profiles up ON up.company_id::text = la.buyer_id::text
    WHERE la.id = lead_assignment_history.assignment_id 
    AND up.id = auth.uid()
  )
);

-- Create execute_auto_purchase function
CREATE OR REPLACE FUNCTION execute_auto_purchase(
  p_lead_id UUID,
  p_buyer_id UUID,
  p_package_id UUID,
  p_cost NUMERIC
) RETURNS TABLE(assignment_id UUID, buyer_id UUID, cost NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Create assignment
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
    '📥 new'::pipeline_stage
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
$$;