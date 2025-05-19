
#!/bin/bash
set -e

# This script seeds test users for E2E testing
echo "Seeding test users for E2E testing..."

# Setup environment variables with defaults
SUPABASE_URL=${SUPABASE_URL:-http://localhost:54321}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}

echo "Using Supabase URL: $SUPABASE_URL"

# SQL template for creating test users and profiles
sql_template=$(cat << EOF
-- Create test users if they don't exist
-- Master Admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000001', 'master-admin@test.local', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', now(), '{"role":"master_admin","name":"Test Master Admin"}')
ON CONFLICT (id) DO NOTHING;

-- Admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000002', 'admin@test.local', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', now(), '{"role":"admin","name":"Test Admin"}')
ON CONFLICT (id) DO NOTHING;

-- Company user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000003', 'company@test.local', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', now(), '{"role":"company","name":"Test Company"}')
ON CONFLICT (id) DO NOTHING;

-- Member user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('00000000-0000-0000-0000-000000000004', 'member@test.local', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', now(), '{"role":"member","name":"Test Member"}')
ON CONFLICT (id) DO NOTHING;

-- Create user profiles
INSERT INTO public.user_profiles (id, full_name, email, role, metadata)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Master Admin', 'master-admin@test.local', 'master_admin', '{"role":"master_admin"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, email, role, metadata)
VALUES ('00000000-0000-0000-0000-000000000002', 'Test Admin', 'admin@test.local', 'admin', '{"role":"admin"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, email, role, metadata)
VALUES ('00000000-0000-0000-0000-000000000003', 'Test Company', 'company@test.local', 'company', '{"role":"company"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, email, role, metadata)
VALUES ('00000000-0000-0000-0000-000000000004', 'Test Member', 'member@test.local', 'member', '{"role":"member"}')
ON CONFLICT (id) DO NOTHING;

-- Enable feature flag for member_dashboard_kanban
INSERT INTO public.feature_flags (name, description, is_enabled, percentage_rollout, target_roles)
VALUES ('member_dashboard_kanban', 'Enable kanban view in member dashboard', true, 100, '{member,admin,master_admin,company}')
ON CONFLICT (name) DO UPDATE SET 
  is_enabled = true,
  percentage_rollout = 100,
  target_roles = '{member,admin,master_admin,company}';
EOF
)

# Execute the SQL template against the Supabase instance
curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$sql_template\"}" \
  --fail

echo "Test users seeded successfully"
