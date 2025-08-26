-- 1) Create RPC to insert anonymous lead and distribute
CREATE OR REPLACE FUNCTION public.create_anonymous_lead_and_distribute(
  p_title text,
  p_description text,
  p_category text,
  p_metadata jsonb,
  p_anonymous_email text,
  p_session_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lead_id uuid;
BEGIN
  INSERT INTO public.leads (
    title,
    description,
    category,
    metadata,
    anonymous_email,
    session_id,
    lead_type,
    submitted_by
  )
  VALUES (
    p_title,
    p_description,
    p_category,
    COALESCE(p_metadata, '{}'::jsonb),
    NULLIF(p_anonymous_email, ''),
    NULLIF(p_session_id, ''),
    'visitor',
    NULL
  )
  RETURNING id INTO v_lead_id;

  -- Attempt distribution; ignore failures to avoid blocking lead creation
  BEGIN
    PERFORM public.distribute_new_lead(v_lead_id);
  EXCEPTION WHEN OTHERS THEN
    -- Optionally log, but do not raise
    NULL;
  END;

  RETURN v_lead_id;
END;
$$;

-- Allow both anon and authenticated clients to execute the function
GRANT EXECUTE ON FUNCTION public.create_anonymous_lead_and_distribute(
  text, text, text, jsonb, text, text
) TO anon, authenticated;

-- 2) Replace risky SELECT policy referencing auth.users with JWT-claims-based version
DO $$ BEGIN
  BEGIN DROP POLICY IF EXISTS "Users can view their attributed leads" ON public.leads; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Users can view their attributed leads"
  ON public.leads
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = submitted_by OR (
        anonymous_email IS NOT NULL AND
        NULLIF(current_setting('request.jwt.claims', true)::json->>'email','') IS NOT NULL AND
        lower(current_setting('request.jwt.claims', true)::json->>'email') = lower(anonymous_email)
      )
    )
  );