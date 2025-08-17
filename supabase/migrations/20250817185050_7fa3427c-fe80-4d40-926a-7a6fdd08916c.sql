-- Fix security definer for trigger function - handle dependencies
DROP TRIGGER IF EXISTS update_lead_assignments_updated_at ON lead_assignments;
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

-- Recreate the trigger
CREATE TRIGGER update_lead_assignments_updated_at
    BEFORE UPDATE ON lead_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_assignment_updated_at();