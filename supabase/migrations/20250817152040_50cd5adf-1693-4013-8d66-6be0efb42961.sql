-- Fix remaining RLS tables and function search paths

-- Enable RLS on remaining tables
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Add policies for user_modules
CREATE POLICY "Users can view their own modules"
  ON public.user_modules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user modules"
  ON public.user_modules
  FOR ALL
  USING (public.get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('admin','master_admin'));

-- Add policies for admin_logs
CREATE POLICY "Only admins can view admin logs"
  ON public.admin_logs
  FOR SELECT
  USING (public.get_auth_user_role() IN ('admin','master_admin'));

CREATE POLICY "Only admins can insert admin logs"
  ON public.admin_logs
  FOR INSERT
  WITH CHECK (public.get_auth_user_role() IN ('admin','master_admin'));

-- Add policies for module_dependencies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view module dependencies"
  ON public.module_dependencies
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage module dependencies"
  ON public.module_dependencies
  FOR ALL
  USING (public.get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('admin','master_admin'));

-- Add policies for service_modules (admin-only management)
CREATE POLICY "Authenticated users can view service modules"
  ON public.service_modules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage service modules"
  ON public.service_modules
  FOR ALL
  USING (public.get_auth_user_role() IN ('admin','master_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('admin','master_admin'));

-- Fix all existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_company_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE insurance_companies 
    SET 
      review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = OLD.company_id),
      customer_rating = (SELECT COALESCE(AVG(rating), 0) FROM company_reviews WHERE company_id = OLD.company_id)
    WHERE id = OLD.company_id;
    RETURN OLD;
  ELSE
    UPDATE insurance_companies 
    SET 
      review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = NEW.company_id),
      customer_rating = (SELECT COALESCE(AVG(rating), 0) FROM company_reviews WHERE company_id = NEW.company_id)
    WHERE id = NEW.company_id;
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_plugin_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_modified_column()
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

CREATE OR REPLACE FUNCTION public.delete_user_profile(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    DELETE FROM user_profiles
    WHERE user_id = delete_user_profile.user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.list_all_user_profiles()
 RETURNS TABLE(id uuid, full_name text, email text, phone text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT up.id, up.full_name, up.email, up.phone, up.created_at, up.updated_at
    FROM user_profiles up;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.has_module_access(module_name text, user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  module_access_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_modules um
    JOIN system_modules sm ON um.module_id = sm.id
    WHERE um.user_id = has_module_access.user_id
    AND sm.name = module_name
    AND um.is_enabled = true
  ) INTO module_access_exists;
  
  RETURN module_access_exists;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_enabled_modules(user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(id uuid, name text, description text, route text, settings jsonb)
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.name,
    sm.description,
    sm.route,
    COALESCE(um.settings, '{}'::jsonb) AS settings
  FROM 
    system_modules sm
  INNER JOIN
    user_modules um ON sm.id = um.module_id
  WHERE
    um.user_id = get_user_enabled_modules.user_id AND
    um.is_enabled = true;
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_plugin_enabled(plugin_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  plugin_status BOOLEAN;
BEGIN
  SELECT is_enabled INTO plugin_status
  FROM plugin_manifests
  WHERE name = plugin_name;
  
  RETURN COALESCE(plugin_status, false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_enabled_plugins()
 RETURNS TABLE(id uuid, name text, version text, description text, entry_point text, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.name,
    pm.version,
    pm.description,
    pm.entry_point,
    pm.metadata
  FROM 
    plugin_manifests pm
  WHERE
    pm.is_enabled = true;
END;
$function$;