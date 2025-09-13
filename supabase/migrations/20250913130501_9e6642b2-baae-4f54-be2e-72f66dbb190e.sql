-- ============================================================================
-- PHASE 3: FIX FUNCTION SECURITY ISSUES - SEARCH PATH MUTABLE
-- ============================================================================

-- Fix functions without proper search_path setting
-- This is critical for preventing SQL injection and privilege escalation

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

-- 4. Fix update_updated_at_column function
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

-- 6. Fix update_user_company_roles_updated_at function
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

-- 7. Fix update_plugin_updated_at function
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

-- 8. Fix update_feature_flags_updated_at function
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

-- ============================================================================
-- PHASE 4: ADD MISSING RLS POLICIES FOR TABLES WITHOUT POLICIES
-- ============================================================================

-- Add policies for tables that have RLS enabled but no policies

-- 1. Import Logs table
CREATE POLICY "import_logs_admin_view" ON public.import_logs
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "import_logs_user_own" ON public.import_logs
FOR SELECT USING (auth.uid() = user_id);

-- 2. Module Access table
CREATE POLICY "module_access_admin_manage" ON public.module_access
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "module_access_user_own" ON public.module_access
FOR SELECT USING (auth.uid() = user_id);

-- 3. Module Dependencies table
CREATE POLICY "module_dependencies_admin_manage" ON public.module_dependencies
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'master_admin'::app_role)
  )
);

CREATE POLICY "module_dependencies_auth_read" ON public.module_dependencies
FOR SELECT USING (auth.uid() IS NOT NULL);