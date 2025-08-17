-- Fix function parameter name conflicts by dropping and recreating

DROP FUNCTION IF EXISTS public.update_user_profile(uuid,text,text,text);
DROP FUNCTION IF EXISTS public.delete_user_profile(uuid);
DROP FUNCTION IF EXISTS public.get_user_profile(uuid);

-- Recreate functions with proper parameter names
CREATE OR REPLACE FUNCTION public.update_user_profile(profile_user_id uuid, profile_full_name text, profile_email text, profile_phone text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    UPDATE user_profiles
    SET full_name = profile_full_name,
        email = profile_email,
        phone = profile_phone,
        updated_at = now()
    WHERE user_id = profile_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_profile(profile_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    DELETE FROM user_profiles
    WHERE user_id = profile_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile(profile_user_id uuid)
 RETURNS TABLE(id uuid, full_name text, email text, phone text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT up.id, up.full_name, up.email, up.phone, up.created_at, up.updated_at
    FROM user_profiles up
    WHERE up.user_id = profile_user_id;
END;
$function$;