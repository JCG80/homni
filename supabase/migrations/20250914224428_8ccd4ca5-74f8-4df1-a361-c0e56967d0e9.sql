-- Secure new role management tables with RLS
-- migrations/20250115_secure_role_tables.sql

-- Enable RLS on all new role tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sod_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles table (read-only for authenticated users, write for master_admin)
CREATE POLICY "roles_authenticated_read" ON public.roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "roles_master_admin_write" ON public.roles
  FOR ALL USING (public.is_master_admin(auth.uid()));

-- RLS Policies for role_scopes table
CREATE POLICY "role_scopes_authenticated_read" ON public.role_scopes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "role_scopes_master_admin_write" ON public.role_scopes
  FOR ALL USING (public.is_master_admin(auth.uid()));

-- RLS Policies for role_templates table
CREATE POLICY "role_templates_authenticated_read" ON public.role_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "role_templates_admin_write" ON public.role_templates
  FOR ALL USING (
    public.is_master_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for role_template_items table
CREATE POLICY "role_template_items_authenticated_read" ON public.role_template_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "role_template_items_admin_write" ON public.role_template_items
  FOR ALL USING (
    public.is_master_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for sod_conflicts table (master_admin only)
CREATE POLICY "sod_conflicts_master_admin_only" ON public.sod_conflicts
  FOR ALL USING (public.is_master_admin(auth.uid()));

-- RLS Policies for audit_locks table (master_admin only)
CREATE POLICY "audit_locks_master_admin_only" ON public.audit_locks
  FOR ALL USING (public.is_master_admin(auth.uid()));

-- RLS Policies for role_requests table
CREATE POLICY "role_requests_own_create" ON public.role_requests
  FOR INSERT WITH CHECK (auth.uid() = requester);

CREATE POLICY "role_requests_own_view" ON public.role_requests
  FOR SELECT USING (
    auth.uid() = requester OR 
    public.is_master_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "role_requests_admin_manage" ON public.role_requests
  FOR UPDATE USING (
    public.is_master_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for admin_action_challenges table (master_admin only)
CREATE POLICY "admin_action_challenges_master_admin_only" ON public.admin_action_challenges
  FOR ALL USING (public.is_master_admin(auth.uid()));

-- RLS Policies for role_audit_log table
CREATE POLICY "role_audit_log_admin_read" ON public.role_audit_log
  FOR SELECT USING (
    public.is_master_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "role_audit_log_system_write" ON public.role_audit_log
  FOR INSERT WITH CHECK (true); -- System can write audit logs