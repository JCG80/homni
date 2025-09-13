-- ============================================================================
-- PHASE 3: FIX FUNCTION SECURITY - MUTABLE SEARCH PATH ISSUES
-- ============================================================================

-- Fix functions with mutable search_path (critical security vulnerability)

-- 1. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', NOW());
  RETURN NEW;
END;
$$;

-- 2. Fix update_modified_column function
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Fix touch_updated_at_mt function
CREATE OR REPLACE FUNCTION public.touch_updated_at_mt()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$;

-- 4. Fix update_user_company_roles_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_company_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Fix update_analytics_updated_at function
CREATE OR REPLACE FUNCTION public.update_analytics_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 6. Fix update_plugin_updated_at function
CREATE OR REPLACE FUNCTION public.update_plugin_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 7. Fix update_feature_flags_updated_at function
CREATE OR REPLACE FUNCTION public.update_feature_flags_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 9. Fix update_lead_assignment_updated_at function
CREATE OR REPLACE FUNCTION public.update_lead_assignment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 10. Fix update_company_rating function
CREATE OR REPLACE FUNCTION public.update_company_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 11. Fix enforce_internal_admin_change function
CREATE OR REPLACE FUNCTION public.enforce_internal_admin_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (COALESCE(NEW.metadata->>'internal_admin', 'false')::boolean) <> (COALESCE(OLD.metadata->>'internal_admin', 'false')::boolean) THEN
    IF NOT public.is_master_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only master_admin can change internal_admin status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 12. Fix sync_user_profile_role function
CREATE OR REPLACE FUNCTION public.sync_user_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_text text;
  v_role_enum public.app_role;
BEGIN
  -- Determine source of truth for this change
  IF TG_OP = 'INSERT' THEN
    v_role_text := COALESCE(NEW.role, NULLIF(NEW.role_enum::text, ''));
  ELSE
    v_role_text := COALESCE(NEW.role, OLD.role);
  END IF;

  -- Normalize role text first
  v_role_text := COALESCE(
    CASE lower(coalesce(v_role_text, 'user'))
      WHEN 'anonymous' THEN 'guest'
      WHEN 'anon' THEN 'guest'
      WHEN 'guest' THEN 'guest'
      WHEN 'member' THEN 'user'
      WHEN 'regular' THEN 'user'
      WHEN 'basic' THEN 'user'
      WHEN 'customer' THEN 'user'
      WHEN 'business' THEN 'company'
      WHEN 'provider' THEN 'company'
      WHEN 'vendor' THEN 'company'
      WHEN 'buyer' THEN 'company'
      WHEN 'editor' THEN 'content_editor'
      WHEN 'moderator' THEN 'content_editor'
      WHEN 'content_admin' THEN 'content_editor'
      WHEN 'super_admin' THEN 'master_admin'
      WHEN 'root' THEN 'master_admin'
      WHEN 'system_admin' THEN 'master_admin'
      WHEN 'admin' THEN 'admin'
      WHEN 'content_editor' THEN 'content_editor'
      WHEN 'company' THEN 'company'
      WHEN 'user' THEN 'user'
      WHEN 'master_admin' THEN 'master_admin'
      ELSE 'user'
    END,
    'user'
  );

  -- Compute enum from normalized text
  v_role_enum := v_role_text::public.app_role;

  -- Set both columns to canonical values
  NEW.role := v_role_text;
  NEW.role_enum := v_role_enum;

  RETURN NEW;
END;
$$;

-- 13. Fix validate_user_role_consistency function
CREATE OR REPLACE FUNCTION public.validate_user_role_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure normalized sync already happened; keep defensive checks
  IF NEW.role_enum::text NOT IN ('guest','user','company','content_editor','admin','master_admin') THEN
    RAISE EXCEPTION 'Invalid role_enum: %', NEW.role_enum;
  END IF;

  -- Ensure user_id = id
  IF NEW.user_id != NEW.id THEN
    NEW.user_id := NEW.id;
  END IF;

  -- Auto-set account_type in metadata
  NEW.metadata := jsonb_set(
    COALESCE(NEW.metadata, '{}'::jsonb),
    '{account_type}',
    CASE WHEN NEW.company_id IS NOT NULL THEN '"company"'::jsonb ELSE '"user"'::jsonb END
  );

  RETURN NEW;
END;
$$;