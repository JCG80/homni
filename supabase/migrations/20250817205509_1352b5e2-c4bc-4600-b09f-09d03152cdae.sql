-- Update RLS policies for anonymous lead insertion with stricter checks
DROP POLICY IF EXISTS "Anonymous can create leads" ON public.leads;

CREATE POLICY "Anonymous can create leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  -- Anonymous can only set safe fields
  submitted_by IS NULL AND 
  company_id IS NULL AND
  (status IS NULL OR status IN ('📥 new', 'new')) AND
  -- Required fields must be present
  title IS NOT NULL AND
  description IS NOT NULL AND
  category IS NOT NULL
);

-- Ensure all functions use SECURITY DEFINER and proper search path
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  r text;
BEGIN
  -- Prefer user_roles with precedence
  SELECT ur.role::text INTO r
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  ORDER BY CASE ur.role
    WHEN 'master_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'company' THEN 3
    WHEN 'content_editor' THEN 4
    WHEN 'member' THEN 5
    ELSE 100
  END
  LIMIT 1;

  IF r IS NOT NULL THEN
    RETURN r;
  END IF;

  -- Fallback to user_profiles.role
  SELECT up.role INTO r
  FROM public.user_profiles up
  WHERE up.id = auth.uid();

  IF r IS NOT NULL THEN
    RETURN r;
  END IF;

  -- Fallback to auth.users raw metadata
  SELECT au.raw_user_meta_data->>'role' INTO r
  FROM auth.users au
  WHERE au.id = auth.uid();
  
  RETURN COALESCE(r, 'member');
END;
$function$;

-- Update has_role function to ensure SECURITY DEFINER and search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(_user_id, auth.uid())
      AND ur.role = _role
  );
$function$;