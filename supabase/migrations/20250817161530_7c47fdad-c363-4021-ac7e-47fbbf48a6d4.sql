-- Tighten RLS scopes to authenticated and align checks with has_role

-- 1) admin_logs: restrict to authenticated and use has_role
DROP POLICY IF EXISTS "Admins can manage admin logs" ON public.admin_logs;
CREATE POLICY "Admins can manage admin logs"
ON public.admin_logs
TO authenticated
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 2) user_roles: add TO authenticated on all policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
TO authenticated
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
TO authenticated
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can insert roles"
ON public.user_roles
TO authenticated
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Admins can update roles"
ON public.user_roles
TO authenticated
FOR UPDATE
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
TO authenticated
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 3) leads: add TO authenticated to all policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can view assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Companies can update their assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads;

CREATE POLICY "Users can view their own leads"
ON public.leads
TO authenticated
FOR SELECT
USING (auth.uid() = submitted_by);

CREATE POLICY "Companies can view assigned leads"
ON public.leads
TO authenticated
FOR SELECT
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND company_id IS NOT NULL
  AND company_id = public.get_current_user_company_id()
);

CREATE POLICY "Admins can view all leads"
ON public.leads
TO authenticated
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Users can create their own leads"
ON public.leads
TO authenticated
FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Companies can update their assigned leads"
ON public.leads
TO authenticated
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND company_id = public.get_current_user_company_id()
);

CREATE POLICY "Admins can update any lead"
ON public.leads
TO authenticated
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

-- 4) lead_history: add TO authenticated and switch to has_role
DROP POLICY IF EXISTS "Admins can view all lead history" ON public.lead_history;
DROP POLICY IF EXISTS "Companies can view history for their leads" ON public.lead_history;

CREATE POLICY "Admins can view all lead history"
ON public.lead_history
TO authenticated
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY "Companies can view history for their leads"
ON public.lead_history
TO authenticated
FOR SELECT
USING (
  public.has_role(auth.uid(), 'company'::public.app_role)
  AND EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_history.lead_id
      AND l.company_id = public.get_current_user_company_id()
  )
);

-- 5) lead_settings: add TO authenticated; keep behavior
DROP POLICY IF EXISTS delete_lead_settings ON public.lead_settings;
DROP POLICY IF EXISTS insert_lead_settings ON public.lead_settings;
DROP POLICY IF EXISTS select_lead_settings ON public.lead_settings;
DROP POLICY IF EXISTS update_lead_settings ON public.lead_settings;

CREATE POLICY delete_lead_settings
ON public.lead_settings
TO authenticated
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY insert_lead_settings
ON public.lead_settings
TO authenticated
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY update_lead_settings
ON public.lead_settings
TO authenticated
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR
  public.has_role(auth.uid(), 'master_admin'::public.app_role)
);

CREATE POLICY select_lead_settings
ON public.lead_settings
TO authenticated
FOR SELECT
USING (true);
