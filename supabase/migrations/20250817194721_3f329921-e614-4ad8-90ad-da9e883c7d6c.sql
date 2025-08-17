-- Update pipeline_stage enum to support new marketplace statuses
-- First, update the enum to include the new stages
DO $$ 
BEGIN
    -- Check if the new values already exist before trying to add them
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '🚀 in_progress' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'pipeline_stage')) THEN
        ALTER TYPE pipeline_stage ADD VALUE '🚀 in_progress';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = '🏆 won' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'pipeline_stage')) THEN
        ALTER TYPE pipeline_stage ADD VALUE '🏆 won';
    END IF;
END $$;

-- Update lead_assignments table to use consistent pipeline stages
UPDATE lead_assignments 
SET pipeline_stage = '🚀 in_progress' 
WHERE pipeline_stage IN ('👀 qualified', '💬 contacted', '📞 negotiating');

UPDATE lead_assignments 
SET pipeline_stage = '🏆 won' 
WHERE pipeline_stage IN ('✅ converted');

-- Ensure all marketplace tables have proper RLS policies
-- Fix critical RLS issues for marketplace functionality

-- Buyer package subscriptions RLS
ALTER TABLE buyer_package_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage subscriptions" ON buyer_package_subscriptions;
DROP POLICY IF EXISTS "Buyers view own subscriptions" ON buyer_package_subscriptions;

CREATE POLICY "Admins manage subscriptions" 
ON buyer_package_subscriptions 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Buyers view own subscriptions" 
ON buyer_package_subscriptions 
FOR SELECT 
TO authenticated
USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.company_id::text = buyer_package_subscriptions.buyer_id::text
));

CREATE POLICY "Buyers manage own subscriptions" 
ON buyer_package_subscriptions 
FOR UPDATE 
TO authenticated
USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.company_id::text = buyer_package_subscriptions.buyer_id::text
));

-- Add missing buyer_package_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS buyer_package_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL,
    package_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    auto_buy BOOLEAN DEFAULT false,
    daily_cap_cents NUMERIC,
    monthly_cap_cents NUMERIC,
    is_paused BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(buyer_id, package_id)
);

-- Add updated_at trigger for buyer_package_subscriptions
CREATE TRIGGER update_buyer_package_subscriptions_updated_at
    BEFORE UPDATE ON buyer_package_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();