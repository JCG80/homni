-- Create smart_start_submissions table with comprehensive tracking
-- This table captures all user interactions with SmartStart for insights and lead generation

CREATE TABLE public.smart_start_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  email TEXT,
  postcode TEXT NOT NULL,
  property_type TEXT,
  requested_services TEXT[] NOT NULL DEFAULT '{}',
  is_company BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'SmartStart',
  step_completed INTEGER NOT NULL DEFAULT 1,
  user_agent TEXT,
  ip_address INET DEFAULT inet_client_addr(),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Search and matching data
  search_query TEXT,
  selected_category TEXT,
  flow_data JSONB DEFAULT '{}',
  
  -- Conversion tracking
  lead_created BOOLEAN DEFAULT false,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_postcode CHECK (postcode ~ '^[0-9]{4}$'),
  CONSTRAINT valid_step CHECK (step_completed >= 1 AND step_completed <= 4),
  CONSTRAINT valid_services CHECK (array_length(requested_services, 1) > 0 OR step_completed < 2)
);

-- Add indexes for performance
CREATE INDEX idx_smart_start_submissions_postcode ON public.smart_start_submissions(postcode);
CREATE INDEX idx_smart_start_submissions_services ON public.smart_start_submissions USING GIN(requested_services);
CREATE INDEX idx_smart_start_submissions_created_at ON public.smart_start_submissions(created_at);
CREATE INDEX idx_smart_start_submissions_user_id ON public.smart_start_submissions(user_id);
CREATE INDEX idx_smart_start_submissions_is_company ON public.smart_start_submissions(is_company);
CREATE INDEX idx_smart_start_submissions_step_completed ON public.smart_start_submissions(step_completed);

-- Enable RLS
ALTER TABLE public.smart_start_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anonymous users can insert their own submissions
CREATE POLICY "Anonymous can insert submissions"
  ON public.smart_start_submissions
  FOR INSERT
  WITH CHECK (
    user_id IS NULL 
    AND session_id IS NOT NULL
    AND step_completed >= 1
  );

-- Authenticated users can insert and view their own submissions
CREATE POLICY "Users can manage own submissions"
  ON public.smart_start_submissions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can view submissions by session_id (for anonymous -> auth conversion)
CREATE POLICY "Users can view by session"
  ON public.smart_start_submissions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND session_id IS NOT NULL
    AND (
      user_id = auth.uid() 
      OR (user_id IS NULL AND email IS NOT NULL)
    )
  );

-- Companies can view submissions in their area for lead generation
CREATE POLICY "Companies view area submissions"
  ON public.smart_start_submissions
  FOR SELECT
  USING (
    has_role(auth.uid(), 'company'::app_role)
    AND lead_created = true
    AND postcode IS NOT NULL
    -- Additional filtering will be done in application layer
  );

-- Admins can view aggregated data
CREATE POLICY "Admins view all submissions"
  ON public.smart_start_submissions
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- Admins can manage submissions
CREATE POLICY "Admins manage submissions"
  ON public.smart_start_submissions
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- System can insert submissions (for API calls)
CREATE POLICY "System can insert submissions"
  ON public.smart_start_submissions
  FOR INSERT
  WITH CHECK (true); -- This allows our functions to insert

-- Create updated_at trigger
CREATE TRIGGER update_smart_start_submissions_updated_at
  BEFORE UPDATE ON public.smart_start_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add column to leads table to link to submissions
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS smart_start_submission_id UUID REFERENCES public.smart_start_submissions(id) ON DELETE SET NULL;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_leads_smart_start_submission_id 
  ON public.leads(smart_start_submission_id);

-- Function to create submission and optionally create lead
CREATE OR REPLACE FUNCTION public.create_smart_start_submission(
  p_session_id TEXT,
  p_postcode TEXT,
  p_requested_services TEXT[],
  p_is_company BOOLEAN DEFAULT false,
  p_search_query TEXT DEFAULT NULL,
  p_selected_category TEXT DEFAULT NULL,
  p_flow_data JSONB DEFAULT '{}',
  p_step_completed INTEGER DEFAULT 1,
  p_email TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission_id UUID;
  v_lead_id UUID;
BEGIN
  -- Insert submission
  INSERT INTO public.smart_start_submissions (
    user_id,
    session_id, 
    postcode,
    requested_services,
    is_company,
    search_query,
    selected_category,
    flow_data,
    step_completed,
    email,
    user_agent,
    metadata
  )
  VALUES (
    p_user_id,
    p_session_id,
    p_postcode,
    p_requested_services,
    p_is_company,
    p_search_query,
    p_selected_category,
    p_flow_data,
    p_step_completed,
    p_email,
    current_setting('request.headers', true)::json->>'user-agent',
    jsonb_build_object(
      'created_via', 'smart_start',
      'ip_address', inet_client_addr()::text
    )
  )
  RETURNING id INTO v_submission_id;

  -- If step 3+ completed and email provided, create lead
  IF p_step_completed >= 3 AND p_email IS NOT NULL THEN
    -- Create lead with comprehensive data
    v_lead_id := public.create_anonymous_lead_and_distribute(
      COALESCE(p_selected_category || ' - ' || p_search_query, 'SmartStart søk'),
      format('SmartStart forespørsel for %s i postnummer %s', 
        array_to_string(p_requested_services, ', '), 
        p_postcode
      ),
      COALESCE(p_selected_category, p_requested_services[1], 'general'),
      jsonb_build_object(
        'source', 'SmartStart',
        'postcode', p_postcode,
        'requested_services', p_requested_services,
        'is_company', p_is_company,
        'search_query', p_search_query,
        'smart_start_submission_id', v_submission_id
      ),
      p_email,
      p_session_id
    );

    -- Update submission with lead info
    UPDATE public.smart_start_submissions
    SET 
      lead_created = true,
      lead_id = v_lead_id,
      converted_at = now(),
      updated_at = now()
    WHERE id = v_submission_id;
  END IF;

  RETURN v_submission_id;
END;
$$;