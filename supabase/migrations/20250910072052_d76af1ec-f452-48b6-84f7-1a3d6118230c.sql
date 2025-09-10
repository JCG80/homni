-- Ensure API Gateway feature flag exists
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, target_roles)
VALUES ('api_gateway', 'Toggle for FastAPI admin/public gateway', true, 100, '{"admin", "master_admin"}')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    target_roles = EXCLUDED.target_roles,
    updated_at = now();