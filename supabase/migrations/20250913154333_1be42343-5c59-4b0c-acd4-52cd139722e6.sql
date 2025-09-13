-- Create messages table for controlled communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'offer', -- 'offer', 'question', 'response', 'system'
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for secure messaging
CREATE POLICY "Users can view messages they're part of"
ON public.messages
FOR SELECT
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Companies can send messages for their purchased leads"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  has_role(auth.uid(), 'company'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.lead_assignments la
    JOIN public.leads l ON l.id = la.lead_id
    WHERE la.lead_id = messages.lead_id
    AND la.buyer_id IN (
      SELECT up.company_id FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() AND up.company_id IS NOT NULL
    )
  )
);

CREATE POLICY "Users can send messages for their own leads"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = messages.lead_id
    AND l.submitted_by = auth.uid()
  )
);

-- Create contact blocking table to track what info companies can see
CREATE TABLE public.lead_contact_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'contact', 'full'
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, company_id)
);

-- Enable RLS
ALTER TABLE public.lead_contact_access ENABLE ROW LEVEL SECURITY;

-- Only admins and the purchasing company can see access records
CREATE POLICY "Companies can view their own access"
ON public.lead_contact_access
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'master_admin'::app_role) OR
  (has_role(auth.uid(), 'company'::app_role) AND 
   company_id IN (
     SELECT up.company_id FROM public.user_profiles up 
     WHERE up.user_id = auth.uid() AND up.company_id IS NOT NULL
   ))
);

-- Create function to check if company has contact access to a lead
CREATE OR REPLACE FUNCTION public.has_contact_access(p_lead_id UUID, p_company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  access_level TEXT := 'none';
BEGIN
  SELECT lca.access_level INTO access_level
  FROM public.lead_contact_access lca
  WHERE lca.lead_id = p_lead_id 
    AND lca.company_id = p_company_id
    AND (lca.expires_at IS NULL OR lca.expires_at > now());
  
  RETURN COALESCE(access_level, 'none');
END;
$function$;

-- Create triggers for updating timestamps
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant access when company purchases lead (trigger on lead_assignments)
CREATE OR REPLACE FUNCTION public.grant_lead_contact_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When a lead is purchased, grant contact access
  IF TG_OP = 'INSERT' AND NEW.auto_purchased_at IS NOT NULL THEN
    INSERT INTO public.lead_contact_access (lead_id, company_id, access_level, purchased_at)
    VALUES (NEW.lead_id, NEW.buyer_id, 'contact', NEW.auto_purchased_at)
    ON CONFLICT (lead_id, company_id) 
    DO UPDATE SET 
      access_level = 'contact',
      purchased_at = NEW.auto_purchased_at;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER lead_assignment_contact_access
  AFTER INSERT ON public.lead_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_lead_contact_access();