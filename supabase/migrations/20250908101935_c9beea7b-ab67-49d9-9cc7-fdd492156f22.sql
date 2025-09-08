-- Add feature flags for dashboard modules
INSERT INTO feature_flags (name, description, is_enabled, target_roles) VALUES
('dash:master_admin', 'Master Admin Platform Control Dashboard', true, ARRAY['master_admin']),
('dash:admin', 'Admin Operations Dashboard', true, ARRAY['admin', 'master_admin']),
('dash:content', 'Content Editor Dashboard', true, ARRAY['content_editor', 'admin', 'master_admin']),
('dash:company', 'Company Business Dashboard', true, ARRAY['company', 'admin', 'master_admin']),
('dash:user', 'User Personal Dashboard', true, ARRAY['user', 'company', 'admin', 'master_admin'])
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
is_enabled = EXCLUDED.is_enabled,
target_roles = EXCLUDED.target_roles;

-- Update module metadata for dashboard system
INSERT INTO module_metadata (name, description, version, dependencies, feature_flags, active) VALUES
('dashboard', 'Role-based Dashboard System', '2.0.0', ARRAY['auth'], 
 '{"master_admin": "dash:master_admin", "admin": "dash:admin", "content": "dash:content", "company": "dash:company", "user": "dash:user"}'::jsonb, 
 true)
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
version = EXCLUDED.version,
dependencies = EXCLUDED.dependencies,
feature_flags = EXCLUDED.feature_flags,
active = EXCLUDED.active;