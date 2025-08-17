-- Standardize RLS policies to use get_auth_user_role()/has_role()
-- and add missing INSERT policies while preserving intended public access

-- PROJECT_DOCS
DROP POLICY IF EXISTS "Anyone can view project docs" ON public.project_docs;
DROP POLICY IF EXISTS "Only admins can delete project docs" ON public.project_docs;
DROP POLICY IF EXISTS "Only admins can edit project docs" ON public.project_docs;
DROP POLICY IF EXISTS "Only admins can insert project docs" ON public.project_docs;

CREATE POLICY "Project docs are publicly viewable"
ON public.project_docs
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert project docs"
ON public.project_docs
FOR INSERT
TO authenticated
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Admins can update project docs"
ON public.project_docs
FOR UPDATE
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Admins can delete project docs"
ON public.project_docs
FOR DELETE
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

-- CONTENT
DROP POLICY IF EXISTS "Admins can manage all content" ON public.content;
DROP POLICY IF EXISTS "Anyone can view published content" ON public.content;

CREATE POLICY "Published content is public"
ON public.content
FOR SELECT
USING (published = true);

CREATE POLICY "Admins and editors manage content"
ON public.content
FOR ALL
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin','content_editor']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin','content_editor']));

-- INSURANCE_TYPES
DROP POLICY IF EXISTS "Anyone can view insurance types" ON public.insurance_types;
DROP POLICY IF EXISTS "Only admins can delete insurance types" ON public.insurance_types;
DROP POLICY IF EXISTS "Only admins can insert insurance types" ON public.insurance_types;
DROP POLICY IF EXISTS "Only admins can update insurance types" ON public.insurance_types;

CREATE POLICY "Insurance types public view"
ON public.insurance_types
FOR SELECT
USING (true);

CREATE POLICY "Admins manage insurance types"
ON public.insurance_types
FOR ALL
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

-- INSURANCE_COMPANIES
DROP POLICY IF EXISTS "Anyone can view insurance companies" ON public.insurance_companies;
DROP POLICY IF EXISTS "Only admins can delete insurance companies" ON public.insurance_companies;
DROP POLICY IF EXISTS "Only admins can insert insurance companies" ON public.insurance_companies;
DROP POLICY IF EXISTS "Only admins can update insurance companies" ON public.insurance_companies;

CREATE POLICY "Insurance companies public view"
ON public.insurance_companies
FOR SELECT
USING (true);

CREATE POLICY "Admins manage insurance companies"
ON public.insurance_companies
FOR ALL
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

-- COMPANY_INSURANCE_TYPES
DROP POLICY IF EXISTS "Anyone can view company insurance types" ON public.company_insurance_types;
DROP POLICY IF EXISTS "Only admins can delete company insurance types" ON public.company_insurance_types;
DROP POLICY IF EXISTS "Only admins can insert company insurance types" ON public.company_insurance_types;
DROP POLICY IF EXISTS "Only admins can update company insurance types" ON public.company_insurance_types;

CREATE POLICY "Company insurance types public view"
ON public.company_insurance_types
FOR SELECT
USING (true);

CREATE POLICY "Admins manage company insurance types"
ON public.company_insurance_types
FOR ALL
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

-- USER_PROFILES
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow anon read user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Keep strict: users see only themselves; admins can view/update all; remove anon read
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']))
WITH CHECK (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

-- PLUGIN_USER_SETTINGS
DROP POLICY IF EXISTS "Admins can view all user plugin settings" ON public.plugin_user_settings;
DROP POLICY IF EXISTS "Users can update their own plugin settings" ON public.plugin_user_settings;
DROP POLICY IF EXISTS "Users can view their own plugin settings" ON public.plugin_user_settings;

CREATE POLICY "Users can view own plugin settings"
ON public.plugin_user_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own plugin settings"
ON public.plugin_user_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all plugin user settings"
ON public.plugin_user_settings
FOR SELECT
TO authenticated
USING (get_auth_user_role() = ANY (ARRAY['admin','master_admin']));

CREATE POLICY "Users can insert own plugin settings"
ON public.plugin_user_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- LEAD_HISTORY
DROP POLICY IF EXISTS "Admins can view all lead history" ON public.lead_history;
DROP POLICY IF EXISTS "Companies can view history for their leads" ON public.lead_history;

CREATE POLICY "Admins can view all lead history"
ON public.lead_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Companies can view history for their leads"
ON public.lead_history
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'company') AND EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_history.lead_id
      AND l.company_id = get_current_user_company_id()
  )
);

CREATE POLICY "Admins can insert lead history"
ON public.lead_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Companies can insert history for their leads"
ON public.lead_history
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'company') AND EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_history.lead_id
      AND l.company_id = get_current_user_company_id()
  )
);

-- NOTE: company_profiles public view policy remains intact for /companies page
-- No changes to system_modules/module_access visibility in this migration.
