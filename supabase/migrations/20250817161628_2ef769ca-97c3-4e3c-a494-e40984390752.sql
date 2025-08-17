-- Fix policy syntax (FOR ... TO ...) and apply tightened RLS

-- 1) admin_logs
DROP POLICY IF EXISTS "Admins can manage admin logs" ON public.admin_logs;
CREATE POLICY "Admins can manage admin logs"
ON public.admin_logs
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 2) user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 3) leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can update their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads;

CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

CREATE POLICY "Companies can view assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND company_id IS NOT NULL
  AND company_id = public.get_current_user_company_id()
);

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Users can create their own leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Companies can update their assigned leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND company_id = public.get_current_user_company_id()
);

CREATE POLICY "Admins can update any lead"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 4) lead_history
DROP POLICY IF EXISTS "Admins can view all lead history" ON public.lead_history;
DROP POLICY IF EXISTS "Companies can view history for their leads" ON public.lead_history;

CREATE POLICY "Admins can view all lead history"
ON public.lead_history
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Companies can view history for their leads"
ON public.lead_history
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_history.lead_id
      AND l.company_id = public.get_current_user_company_id()
  )
);

-- 5) lead_settings
DROP POLICY IF EXISTS delete_lead_settings ON public.lead_settings;
DROP POLICY IF EXISTS insert_lead_settings ON public.lead_settings;
DROP POLICY IF EXISTS select_lead_settings ON public.lead_settings;
DROP POLICY IF EXISTS update_lead_settings ON public.lead_settings;

CREATE POLICY delete_lead_settings
ON public.lead_settings
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY insert_lead_settings
ON public.lead_settings
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY update_lead_settings
ON public.lead_settings
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY select_lead_settings
ON public.lead_settings
FOR SELECT
TO authenticated
USING (true);
