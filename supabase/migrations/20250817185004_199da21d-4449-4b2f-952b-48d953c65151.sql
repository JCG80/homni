-- Fix security definer for trigger function
DROP FUNCTION IF EXISTS public.update_lead_assignment_updated_at();

CREATE OR REPLACE FUNCTION public.update_lead_assignment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;