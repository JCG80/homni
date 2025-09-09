-- Enforce only master_admin can change internal_admin flag on user_profiles.metadata
CREATE OR REPLACE FUNCTION public.enforce_internal_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF (COALESCE(NEW.metadata->>'internal_admin', 'false')::boolean) <> (COALESCE(OLD.metadata->>'internal_admin', 'false')::boolean) THEN
    IF NOT public.is_master_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only master_admin can change internal_admin status';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate trigger to attach the enforcement function
DROP TRIGGER IF EXISTS trg_enforce_internal_admin_change ON public.user_profiles;
CREATE TRIGGER trg_enforce_internal_admin_change
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_internal_admin_change();