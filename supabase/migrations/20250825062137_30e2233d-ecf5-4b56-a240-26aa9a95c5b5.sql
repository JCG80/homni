-- Fix remaining SECURITY DEFINER functions to include SET search_path = public

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(_user_id, auth.uid())
      AND ur.role = _role
  );
$function$;

-- Fix has_role_grant function
CREATE OR REPLACE FUNCTION public.has_role_grant(_role app_role, _user_id uuid DEFAULT auth.uid(), _context text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.role_grants rg
    WHERE rg.user_id = COALESCE(_user_id, auth.uid())
      AND rg.role = _role
      AND rg.is_active = true
      AND rg.revoked_at IS NULL
      AND (rg.expires_at IS NULL OR rg.expires_at > now())
      AND (_context IS NULL OR rg.context = _context)
  );
$function$;

-- Fix get_user_role_level function
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(MAX(
    CASE 
      WHEN role = 'master_admin' THEN 100
      WHEN role = 'admin' THEN 80
      WHEN role = 'content_editor' THEN 60
      WHEN role = 'company' THEN 40
      WHEN role = 'user' THEN 20
      WHEN role = 'guest' THEN 0
      ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

-- Fix has_role_level function
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_level integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.get_user_role_level(_user_id) >= _min_level
$function$;