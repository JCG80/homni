-- Feature Flags for Sprint Stabilization
-- Create feature flags with Sprint 4-6 features disabled by default

-- Insert feature flags with default OFF state for Sprint 4-6 features
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, target_roles, created_at, updated_at) VALUES
  -- Sprint 1-3 features (enabled)
  ('ENABLE_LEAD_DISTRIBUTION', 'Enable lead distribution system', true, 100, '["user", "company", "admin", "master_admin"]', now(), now()),
  ('ENABLE_ADMIN_LEAD_DISTRIBUTION', 'Enable admin lead distribution panel', true, 100, '["admin", "master_admin"]', now(), now()),
  
  -- Sprint 4-6 features (disabled by default during stabilization)
  ('ENABLE_ANALYTICS_DASHBOARD', 'Enable analytics dashboard and reporting', false, 0, '["user", "company", "admin", "master_admin"]', now(), now()),
  ('ENABLE_PROPERTY_MANAGEMENT', 'Enable property management features', false, 0, '["user", "company", "admin", "master_admin"]', now(), now()),
  ('ENABLE_DIY_SALES', 'Enable DIY sales features', false, 0, '["user", "company", "admin", "master_admin"]', now(), now()),
  ('ENABLE_ONBOARDING_WIZARD', 'Enable onboarding wizard for new users', false, 0, '["guest"]', now(), now()),
  
  -- Future features
  ('ENABLE_MARKETPLACE', 'Enable marketplace features', false, 0, '["user", "company", "admin", "master_admin"]', now(), now()),
  ('ENABLE_ADVANCED_REPORTING', 'Enable advanced reporting features', false, 0, '["company", "admin", "master_admin"]', now(), now())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();