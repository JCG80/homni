-- Complete Master Admin Infrastructure Database Schema

-- Create feature_flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS policies for feature_flags
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags
  FOR SELECT USING (true);

CREATE POLICY "Only master_admin can modify feature flags" ON public.feature_flags
  FOR ALL USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- Create system_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  route TEXT,
  icon TEXT,
  category TEXT NOT NULL DEFAULT 'core',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  dependencies TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on system_modules
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for system_modules
CREATE POLICY "Authenticated users can read system modules" ON public.system_modules
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only master_admin can modify system modules" ON public.system_modules
  FOR ALL USING (has_role(auth.uid(), 'master_admin'::app_role))  
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- Create user_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.system_modules(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on user_modules
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_modules
CREATE POLICY "Users can read their own module access" ON public.user_modules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all module access" ON public.user_modules
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Create performance_metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL DEFAULT 'ms',
  service_name TEXT NOT NULL DEFAULT 'api_gateway',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for performance_metrics
CREATE POLICY "Only admins can access performance metrics" ON public.performance_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master_admin'::app_role));

-- Insert default system modules
INSERT INTO public.system_modules (name, description, route, icon, category, sort_order) VALUES
  ('dashboard', 'Main dashboard access', '/dashboard', 'Home', 'core', 1),
  ('leads', 'Lead management', '/leads', 'Users', 'business', 2),
  ('properties', 'Property management', '/properties', 'Building', 'business', 3),
  ('analytics', 'Analytics and reporting', '/analytics', 'BarChart', 'business', 4),
  ('settings', 'User settings', '/settings', 'Settings', 'core', 5),
  ('admin', 'Admin panel access', '/admin', 'Shield', 'admin', 6),
  ('feature-flags', 'Feature flag management', '/admin/feature-flags', 'Flag', 'admin', 7),
  ('modules', 'System module management', '/admin/modules', 'Grid3x3', 'admin', 8),
  ('market-trends', 'Market trends analysis', '/admin/market-trends', 'TrendingUp', 'admin', 9),
  ('api-gateway', 'API Gateway monitoring', '/admin/api-gateway', 'Activity', 'admin', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert default feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, rollout_percentage, target_roles) VALUES
  ('leads-module', 'Enable leads management module', true, 100, ARRAY['user', 'company', 'admin', 'master_admin']),
  ('boligmappa-module', 'Enable Boligmappa property management', true, 100, ARRAY['user', 'company', 'admin', 'master_admin']),
  ('propr-module', 'Enable Propr DIY selling features', false, 0, ARRAY['company', 'admin', 'master_admin']),
  ('ai-integration', 'Enable AI-powered features', false, 25, ARRAY['admin', 'master_admin']),
  ('advanced-analytics', 'Enable advanced analytics dashboard', true, 100, ARRAY['company', 'admin', 'master_admin']),
  ('lead-marketplace', 'Enable lead marketplace features', false, 0, ARRAY['company', 'admin', 'master_admin'])
ON CONFLICT (name) DO NOTHING;

-- Create audit log for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for admin_audit_log
CREATE POLICY "Only master_admin can access audit log" ON public.admin_audit_log
  FOR ALL USING (has_role(auth.uid(), 'master_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_type,
    target_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;