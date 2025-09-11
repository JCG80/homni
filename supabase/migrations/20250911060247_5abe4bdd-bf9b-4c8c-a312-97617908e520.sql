-- Enable property management feature flag
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, target_roles, created_at, updated_at)
VALUES (
  'ENABLE_PROPERTY_MANAGEMENT',
  'Enable the comprehensive property management system with documents and maintenance tracking',
  true,
  100,
  ARRAY['user', 'company', 'admin', 'master_admin'],
  now(),
  now()
)
ON CONFLICT (name) DO UPDATE SET
  is_enabled = true,
  rollout_percentage = 100,
  target_roles = ARRAY['user', 'company', 'admin', 'master_admin'],
  updated_at = now();