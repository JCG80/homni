-- Lead Marketplace Database Schema
-- Create lead marketplace tables with comprehensive RLS policies

-- Drop existing enum if exists and recreate with emojis
DROP TYPE IF EXISTS pipeline_stage CASCADE;
CREATE TYPE pipeline_stage AS ENUM (
  '📥 new',
  '👀 qualified', 
  '💬 contacted',
  '📞 negotiating',
  '✅ converted',
  '❌ lost',
  '⏸️ paused'
);

-- Lead packages table (subscription tiers)
CREATE TABLE IF NOT EXISTS public.lead_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_per_lead DECIMAL(10,2) NOT NULL,
  monthly_price DECIMAL(10,2),
  lead_cap_per_day INTEGER,
  lead_cap_per_month INTEGER,
  priority_level INTEGER DEFAULT 1,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Buyer accounts (companies purchasing leads)
CREATE TABLE IF NOT EXISTS public.buyer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  billing_address JSONB,
  current_budget DECIMAL(10,2) DEFAULT 0,
  daily_budget DECIMAL(10,2),
  monthly_budget DECIMAL(10,2),
  auto_recharge BOOLEAN DEFAULT false,
  pause_when_budget_exceeded BOOLEAN DEFAULT true,
  preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  geographical_scope TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Buyer package subscriptions
CREATE TABLE IF NOT EXISTS public.buyer_package_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.buyer_accounts(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.lead_packages(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, package_id)
);

-- Lead assignments (track which leads go to which buyers)
CREATE TABLE IF NOT EXISTS public.lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.buyer_accounts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  cost DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  accepted_at TIMESTAMPTZ,
  rejection_reason TEXT,
  buyer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id, buyer_id)
);

-- Buyer spend ledger (track budget usage)
CREATE TABLE IF NOT EXISTS public.buyer_spend_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.buyer_accounts(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.lead_assignments(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'refund', 'adjustment', 'recharge')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  balance_after DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Update existing leads table to support new pipeline stages
ALTER TABLE public.leads ALTER COLUMN status TYPE pipeline_stage USING status::pipeline_stage;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead_id ON public.lead_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_buyer_id ON public.lead_assignments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_status ON public.lead_assignments(status);
CREATE INDEX IF NOT EXISTS idx_buyer_spend_ledger_buyer_id ON public.buyer_spend_ledger(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_spend_ledger_created_at ON public.buyer_spend_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);

-- Lead distribution function with idempotency and locking
CREATE OR REPLACE FUNCTION public.distribute_new_lead(lead_uuid UUID)
RETURNS TABLE(assigned_buyer_id UUID, assignment_cost DECIMAL) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  eligible_buyers CURSOR FOR
    SELECT ba.id, ba.current_budget, lp.price_per_lead, lp.priority_level
    FROM buyer_accounts ba
    JOIN buyer_package_subscriptions bps ON ba.id = bps.buyer_id
    JOIN lead_packages lp ON bps.package_id = lp.id
    WHERE ba.current_budget >= lp.price_per_lead
      AND bps.status = 'active'
      AND (bps.end_date IS NULL OR bps.end_date > now())
    ORDER BY lp.priority_level DESC, random()
    FOR UPDATE SKIP LOCKED;
  
  buyer_record RECORD;
  lead_cost DECIMAL;
  new_balance DECIMAL;
BEGIN
  -- Check if lead already assigned
  IF EXISTS (SELECT 1 FROM lead_assignments WHERE lead_id = lead_uuid) THEN
    RAISE NOTICE 'Lead % already assigned', lead_uuid;
    RETURN;
  END IF;

  -- Find eligible buyer with row-level locking
  OPEN eligible_buyers;
  FETCH eligible_buyers INTO buyer_record;
  
  IF NOT FOUND THEN
    CLOSE eligible_buyers;
    RAISE NOTICE 'No eligible buyers for lead %', lead_uuid;
    RETURN;
  END IF;
  
  lead_cost := buyer_record.price_per_lead;
  new_balance := buyer_record.current_budget - lead_cost;
  
  -- Create assignment
  INSERT INTO lead_assignments (lead_id, buyer_id, cost, status)
  VALUES (lead_uuid, buyer_record.id, lead_cost, 'assigned');
  
  -- Update buyer budget
  UPDATE buyer_accounts 
  SET current_budget = new_balance, updated_at = now()
  WHERE id = buyer_record.id;
  
  -- Record transaction
  INSERT INTO buyer_spend_ledger (buyer_id, transaction_type, amount, balance_after, description)
  VALUES (buyer_record.id, 'charge', -lead_cost, new_balance, 'Lead assignment: ' || lead_uuid);
  
  -- Update lead status
  UPDATE leads SET status = '👀 qualified'::pipeline_stage WHERE id = lead_uuid;
  
  CLOSE eligible_buyers;
  
  assigned_buyer_id := buyer_record.id;
  assignment_cost := lead_cost;
  RETURN NEXT;
END;
$$;

-- Enable RLS on all new tables
ALTER TABLE public.lead_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_package_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_spend_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Default deny with explicit allow

-- Lead packages - public read, admin manage
CREATE POLICY "Lead packages public read" ON public.lead_packages FOR SELECT TO PUBLIC USING (is_active = true);
CREATE POLICY "Admins manage lead packages" ON public.lead_packages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Buyer accounts - buyers see own, admins see all
CREATE POLICY "Buyers view own account" ON public.buyer_accounts FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND company_id::text = buyer_accounts.id::text)
);
CREATE POLICY "Admins manage buyer accounts" ON public.buyer_accounts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Buyer subscriptions - buyers see own, admins see all
CREATE POLICY "Buyers view own subscriptions" ON public.buyer_package_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND company_id::text = buyer_id::text)
);
CREATE POLICY "Admins manage subscriptions" ON public.buyer_package_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Lead assignments - buyers see assigned to them, admins see all
CREATE POLICY "Buyers view assigned leads" ON public.lead_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND company_id::text = buyer_id::text)
);
CREATE POLICY "Admins manage assignments" ON public.lead_assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Spend ledger - buyers see own, admins see all  
CREATE POLICY "Buyers view own spending" ON public.buyer_spend_ledger FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND company_id::text = buyer_id::text)
);
CREATE POLICY "Admins manage spending" ON public.buyer_spend_ledger FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_packages_updated_at BEFORE UPDATE ON public.lead_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_accounts_updated_at BEFORE UPDATE ON public.buyer_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_subscriptions_updated_at BEFORE UPDATE ON public.buyer_package_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_assignments_updated_at BEFORE UPDATE ON public.lead_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();