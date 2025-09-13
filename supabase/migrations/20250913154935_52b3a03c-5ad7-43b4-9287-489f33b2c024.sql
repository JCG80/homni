-- Create lead scoring and quality system
CREATE TABLE public.lead_quality_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0, -- 0-100 scale
  completeness_score INTEGER NOT NULL DEFAULT 0, -- How complete is the lead info
  urgency_score INTEGER NOT NULL DEFAULT 0, -- How urgent is the request
  budget_indicator_score INTEGER NOT NULL DEFAULT 0, -- Indicators of budget availability
  location_score INTEGER NOT NULL DEFAULT 0, -- Location desirability
  category_demand_score INTEGER NOT NULL DEFAULT 0, -- How in-demand is this category
  contact_quality_score INTEGER NOT NULL DEFAULT 0, -- Quality of contact information
  scoring_factors JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

-- Enable RLS
ALTER TABLE public.lead_quality_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for lead quality scores
CREATE POLICY "Admins can manage lead quality scores"
ON public.lead_quality_scores
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Companies can view scores for accessible leads"
ON public.lead_quality_scores
FOR SELECT
USING (
  has_role(auth.uid(), 'company'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.lead_contact_access lca
    WHERE lca.lead_id = lead_quality_scores.lead_id
    AND lca.company_id IN (
      SELECT up.company_id FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() AND up.company_id IS NOT NULL
    )
  )
);

-- Create lead pricing tiers table
CREATE TABLE public.lead_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  min_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  base_price_cents INTEGER NOT NULL DEFAULT 50000, -- 500 NOK default
  preview_access_level TEXT NOT NULL DEFAULT 'basic', -- 'none', 'basic', 'contact', 'full'
  full_access_price_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  time_limit_hours INTEGER DEFAULT 168, -- 7 days default
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing tiers
CREATE POLICY "Everyone can view active pricing tiers"
ON public.lead_pricing_tiers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage pricing tiers"
ON public.lead_pricing_tiers
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role)
);

-- Insert default pricing tiers
INSERT INTO public.lead_pricing_tiers (name, min_score, max_score, base_price_cents, preview_access_level, full_access_price_multiplier, time_limit_hours) VALUES
('Bronze', 0, 30, 30000, 'basic', 1.0, 72),
('Silver', 31, 60, 50000, 'basic', 1.2, 120),  
('Gold', 61, 85, 75000, 'contact', 1.5, 168),
('Platinum', 86, 100, 100000, 'contact', 2.0, 240);

-- Create competitive bidding table
CREATE TABLE public.lead_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  bid_amount_cents INTEGER NOT NULL,
  max_budget_cents INTEGER NOT NULL,
  auto_bid BOOLEAN NOT NULL DEFAULT false,
  message TEXT, -- Company's message to lead owner
  bid_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'won', 'lost', 'withdrawn'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_bids ENABLE ROW LEVEL SECURITY;

-- Create policies for lead bids
CREATE POLICY "Companies can view their own bids"
ON public.lead_bids
FOR SELECT
USING (
  has_role(auth.uid(), 'company'::app_role) AND
  company_id IN (
    SELECT up.company_id FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() AND up.company_id IS NOT NULL
  )
);

CREATE POLICY "Companies can create bids"
ON public.lead_bids
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'company'::app_role) AND
  auth.uid() IN (
    SELECT up.user_id FROM public.user_profiles up 
    WHERE up.company_id = lead_bids.company_id
  )
);

CREATE POLICY "Lead owners can view bids on their leads"
ON public.lead_bids
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_bids.lead_id
    AND l.submitted_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage all bids"
ON public.lead_bids
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role)
);

-- Create function to calculate lead score
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_record public.leads%ROWTYPE;
  completeness INTEGER := 0;
  urgency INTEGER := 50; -- Default middle score
  budget_indicator INTEGER := 30; -- Conservative default
  location INTEGER := 50; -- Default middle score
  category_demand INTEGER := 50; -- Default middle score
  contact_quality INTEGER := 0;
  final_score INTEGER;
BEGIN
  -- Get lead details
  SELECT * INTO lead_record FROM public.leads WHERE id = p_lead_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate completeness score (0-30 points)
  IF lead_record.title IS NOT NULL AND length(lead_record.title) > 10 THEN
    completeness := completeness + 5;
  END IF;
  
  IF lead_record.description IS NOT NULL AND length(lead_record.description) > 50 THEN
    completeness := completeness + 8;
  END IF;
  
  IF lead_record.category IS NOT NULL THEN
    completeness := completeness + 5;
  END IF;
  
  IF lead_record.customer_name IS NOT NULL THEN
    completeness := completeness + 4;
  END IF;
  
  IF lead_record.customer_email IS NOT NULL THEN
    completeness := completeness + 4;
  END IF;
  
  IF lead_record.customer_phone IS NOT NULL THEN
    completeness := completeness + 4;
  END IF;

  -- Calculate contact quality score (0-25 points)
  IF lead_record.customer_email IS NOT NULL AND lead_record.customer_email LIKE '%@%.%' THEN
    contact_quality := contact_quality + 10;
  END IF;
  
  IF lead_record.customer_phone IS NOT NULL AND length(lead_record.customer_phone) >= 8 THEN
    contact_quality := contact_quality + 8;
  END IF;
  
  IF lead_record.customer_name IS NOT NULL AND length(lead_record.customer_name) >= 3 THEN
    contact_quality := contact_quality + 7;
  END IF;

  -- Calculate urgency based on keywords (0-20 points)
  IF lead_record.description ILIKE ANY(ARRAY['%haster%', '%akutt%', '%øyeblikkelig%', '%nå%', '%asap%']) THEN
    urgency := 80;
  ELSIF lead_record.description ILIKE ANY(ARRAY['%snart%', '%raskt%', '%fort%']) THEN
    urgency := 65;
  ELSIF lead_record.description ILIKE ANY(ARRAY['%ingen hast%', '%god tid%', '%planlegger%']) THEN
    urgency := 25;
  END IF;

  -- Budget indicators (0-15 points)  
  IF lead_record.description ILIKE ANY(ARRAY['%budsjett%', '%kr%', '%krone%', '%kostnad%', '%pris%']) THEN
    budget_indicator := 60;
  END IF;
  
  IF lead_record.description ILIKE ANY(ARRAY['%kvalitet%', '%best%', '%profesjonell%']) THEN
    budget_indicator := budget_indicator + 15;
  END IF;

  -- Category demand scoring (0-10 points) - simplified
  CASE 
    WHEN lead_record.category ILIKE ANY(ARRAY['%elektr%', '%rør%', '%bygg%']) THEN
      category_demand := 70; -- High demand categories
    WHEN lead_record.category ILIKE ANY(ARRAY['%mal%', '%snekk%', '%tak%']) THEN
      category_demand := 60; -- Medium-high demand
    ELSE
      category_demand := 40; -- Standard demand
  END CASE;

  -- Calculate final weighted score
  final_score := LEAST(100, 
    (completeness * 0.30 + 
     urgency * 0.20 + 
     budget_indicator * 0.15 + 
     location * 0.10 + 
     category_demand * 0.10 + 
     contact_quality * 0.15)::INTEGER
  );

  -- Insert or update score
  INSERT INTO public.lead_quality_scores (
    lead_id, overall_score, completeness_score, urgency_score, 
    budget_indicator_score, location_score, category_demand_score, 
    contact_quality_score, scoring_factors
  )
  VALUES (
    p_lead_id, final_score, completeness, urgency,
    budget_indicator, location, category_demand, contact_quality,
    jsonb_build_object(
      'title_length', length(coalesce(lead_record.title, '')),
      'description_length', length(coalesce(lead_record.description, '')),
      'has_customer_info', (lead_record.customer_email IS NOT NULL OR lead_record.customer_phone IS NOT NULL)
    )
  )
  ON CONFLICT (lead_id) 
  DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    completeness_score = EXCLUDED.completeness_score,
    urgency_score = EXCLUDED.urgency_score,
    budget_indicator_score = EXCLUDED.budget_indicator_score,
    location_score = EXCLUDED.location_score,
    category_demand_score = EXCLUDED.category_demand_score,
    contact_quality_score = EXCLUDED.contact_quality_score,
    scoring_factors = EXCLUDED.scoring_factors,
    calculated_at = now(),
    updated_at = now();

  RETURN final_score;
END;
$function$;

-- Create trigger to auto-calculate score when lead is inserted/updated
CREATE OR REPLACE FUNCTION public.trigger_calculate_lead_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calculate score asynchronously to avoid slowing down lead creation
  PERFORM public.calculate_lead_score(NEW.id);
  RETURN NEW;
END;
$function$;

CREATE TRIGGER auto_calculate_lead_score
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_calculate_lead_score();

-- Create function to get lead pricing
CREATE OR REPLACE FUNCTION public.get_lead_pricing(p_lead_id UUID)
RETURNS TABLE(
  tier_name TEXT,
  base_price_cents INTEGER,
  preview_access_level TEXT,
  full_price_cents INTEGER,
  score INTEGER
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lead_score INTEGER;
BEGIN
  -- Get or calculate lead score
  SELECT overall_score INTO lead_score
  FROM public.lead_quality_scores
  WHERE lead_id = p_lead_id;
  
  IF lead_score IS NULL THEN
    lead_score := public.calculate_lead_score(p_lead_id);
  END IF;

  -- Return pricing tier info
  RETURN QUERY
  SELECT 
    lpt.name,
    lpt.base_price_cents,
    lpt.preview_access_level,
    (lpt.base_price_cents * lpt.full_access_price_multiplier)::INTEGER,
    lead_score
  FROM public.lead_pricing_tiers lpt
  WHERE lpt.is_active = true
    AND lead_score BETWEEN lpt.min_score AND lpt.max_score
  ORDER BY lpt.min_score DESC
  LIMIT 1;
END;
$function$;

-- Create triggers for updating timestamps
CREATE TRIGGER update_lead_quality_scores_updated_at
  BEFORE UPDATE ON public.lead_quality_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_pricing_tiers_updated_at
  BEFORE UPDATE ON public.lead_pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_bids_updated_at
  BEFORE UPDATE ON public.lead_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();