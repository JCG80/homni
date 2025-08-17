-- Create distribute_new_lead function for automated lead distribution
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_id_param UUID)
RETURNS TABLE(buyer_id UUID, assignment_id UUID, cost NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead_record leads%ROWTYPE;
  package_record lead_packages%ROWTYPE;
  buyer_record buyer_accounts%ROWTYPE;
  assignment_record RECORD;
  buyer_current_spend NUMERIC;
BEGIN
  -- Get the lead details
  SELECT * INTO lead_record FROM leads WHERE id = lead_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', lead_id_param;
  END IF;
  
  -- Find active packages that match the lead category
  FOR package_record IN 
    SELECT * FROM lead_packages 
    WHERE is_active = true 
    ORDER BY priority_level DESC
  LOOP
    -- Find buyers subscribed to this package with available budget
    FOR buyer_record IN
      SELECT ba.* FROM buyer_accounts ba
      INNER JOIN buyer_package_subscriptions bps ON ba.id = bps.buyer_id
      WHERE bps.package_id = package_record.id
        AND bps.status = 'active'
        AND ba.current_budget >= package_record.price_per_lead
        AND NOT ba.pause_when_budget_exceeded
    LOOP
      -- Check daily spending limits
      SELECT COALESCE(SUM(amount), 0) INTO buyer_current_spend
      FROM buyer_spend_ledger
      WHERE buyer_id = buyer_record.id
        AND DATE(created_at) = CURRENT_DATE;
      
      -- Check if buyer can afford this lead
      IF (buyer_record.daily_budget IS NULL OR buyer_current_spend + package_record.price_per_lead <= buyer_record.daily_budget) THEN
        -- Create assignment
        INSERT INTO lead_assignments (lead_id, buyer_id, cost, status)
        VALUES (lead_id_param, buyer_record.id, package_record.price_per_lead, 'assigned')
        RETURNING * INTO assignment_record;
        
        -- Record spending
        INSERT INTO buyer_spend_ledger (
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
        UPDATE buyer_accounts 
        SET current_budget = current_budget - package_record.price_per_lead
        WHERE id = buyer_record.id;
        
        -- Update lead assignment
        UPDATE leads 
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
$$;

-- Add pipeline stage enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_stage') THEN
        CREATE TYPE pipeline_stage AS ENUM ('📥 new', '🚀 in_progress', '🏆 won', '❌ lost');
    END IF;
END $$;

-- Ensure lead_assignments has pipeline_stage column
ALTER TABLE lead_assignments 
ADD COLUMN IF NOT EXISTS pipeline_stage pipeline_stage DEFAULT '📥 new';

-- Add updated_at trigger for lead_assignments
CREATE OR REPLACE FUNCTION update_lead_assignment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_assignments_updated_at
  BEFORE UPDATE ON lead_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_assignment_updated_at();