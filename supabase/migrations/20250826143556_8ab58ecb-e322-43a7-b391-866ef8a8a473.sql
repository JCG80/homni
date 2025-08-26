-- Add lead attribution support for linking anonymous leads to user accounts
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS anonymous_email TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS attributed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient email and session lookups
CREATE INDEX IF NOT EXISTS idx_leads_anonymous_email ON public.leads(anonymous_email) WHERE anonymous_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON public.leads(session_id) WHERE session_id IS NOT NULL;

-- Create function to link anonymous leads to authenticated users
CREATE OR REPLACE FUNCTION public.link_anonymous_leads_to_user(user_id_param UUID, user_email_param TEXT)
RETURNS TABLE(linked_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  update_count INTEGER;
BEGIN
  -- Link leads by email match where user is not already set
  UPDATE public.leads 
  SET 
    submitted_by = user_id_param,
    attributed_at = NOW(),
    updated_at = NOW()
  WHERE 
    anonymous_email = user_email_param 
    AND submitted_by IS NULL
    AND attributed_at IS NULL;
    
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  RETURN QUERY SELECT update_count;
END;
$$;

-- Add RLS policy for attributed leads
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leads' 
    AND policyname = 'Users can view their attributed leads'
  ) THEN
    CREATE POLICY "Users can view their attributed leads" 
    ON public.leads 
    FOR SELECT 
    USING (
      auth.uid() = submitted_by 
      OR (anonymous_email IS NOT NULL AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = leads.anonymous_email
      ))
    );
  END IF;
END $$;