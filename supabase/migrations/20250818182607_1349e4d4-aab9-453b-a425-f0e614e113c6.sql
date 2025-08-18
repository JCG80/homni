-- Fix function security by adding missing SET search_path = public
-- These functions currently lack proper search_path configuration

-- Fix ensure_user_profile function
CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id uuid, p_role text DEFAULT NULL::text, p_company_id uuid DEFAULT NULL::uuid)
 RETURNS user_profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  v_role text;
  v_row public.user_profiles;
BEGIN
  -- Normalise role to canonical values
  v_role := COALESCE(
    CASE lower(coalesce(p_role, 'anonymous'))
      WHEN 'anonymous' THEN 'anonymous'
      WHEN 'guest' THEN 'anonymous'
      WHEN 'member' THEN 'user'
      WHEN 'regular' THEN 'user'
      WHEN 'basic' THEN 'user'
      WHEN 'business' THEN 'company'
      WHEN 'provider' THEN 'company'
      WHEN 'editor' THEN 'content_editor'
      WHEN 'moderator' THEN 'content_editor'
      WHEN 'super_admin' THEN 'master_admin'
      WHEN 'root' THEN 'master_admin'
      ELSE p_role
    END,
    'anonymous'
  );

  -- Insert or update profile with both id and user_id set to the same value
  INSERT INTO public.user_profiles (
    id, 
    user_id, 
    role, 
    company_id,
    metadata,
    notification_preferences,
    ui_preferences,
    feature_overrides
  )
  VALUES (
    p_user_id, 
    p_user_id, 
    v_role, 
    p_company_id,
    '{}',
    '{}',
    '{}',
    '{}'
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      user_id = p_user_id,
      role = EXCLUDED.role,
      company_id = COALESCE(EXCLUDED.company_id, public.user_profiles.company_id),
      updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END$function$;

-- Fix validate_user_role_consistency function
CREATE OR REPLACE FUNCTION public.validate_user_role_consistency()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure the role is a canonical role
  IF NEW.role NOT IN ('guest', 'user', 'company', 'content_editor', 'admin', 'master_admin') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be one of: guest, user, company, content_editor, admin, master_admin', NEW.role;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix validate_role_grant function
CREATE OR REPLACE FUNCTION public.validate_role_grant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at must be in the future';
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_company_rating function
CREATE OR REPLACE FUNCTION public.update_company_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Update the company's review count and average rating
    UPDATE insurance_companies 
    SET 
      review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = OLD.company_id),
      customer_rating = (SELECT COALESCE(AVG(rating), 0) FROM company_reviews WHERE company_id = OLD.company_id)
    WHERE id = OLD.company_id;
    RETURN OLD;
  ELSE
    -- Update the company's review count and average rating
    UPDATE insurance_companies 
    SET 
      review_count = (SELECT COUNT(*) FROM company_reviews WHERE company_id = NEW.company_id),
      customer_rating = (SELECT COALESCE(AVG(rating), 0) FROM company_reviews WHERE company_id = NEW.company_id)
    WHERE id = NEW.company_id;
    RETURN NEW;
  END IF;
END;
$function$;