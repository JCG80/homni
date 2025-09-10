-- Add feature flags for SmartStart and Insights modules
INSERT INTO public.feature_flags (name, description, is_enabled, target_roles)
VALUES 
  ('ENABLE_SMART_START', 'Enable SmartStart lead generation flow', true, ARRAY['guest', 'user', 'company', 'admin', 'master_admin']),
  ('ENABLE_SMART_INSIGHTS', 'Enable SmartStart insights dashboard for admins', true, ARRAY['admin', 'master_admin'])
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled,
  target_roles = EXCLUDED.target_roles,
  updated_at = now();