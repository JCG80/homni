-- Unified Data Models Migration - Phase 1: Core Schema Alignment
-- Implements the unified UserProfile and CompanyProfile structures from the development plan

-- First, ensure we have the required tables with proper structure
-- Update user_profiles table to match unified model requirements
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Ensure notification_preferences has proper structure
UPDATE user_profiles 
SET notification_preferences = jsonb_build_object(
  'email', COALESCE((notification_preferences->>'email')::boolean, true),
  'sms', COALESCE((notification_preferences->>'sms')::boolean, false),
  'push', COALESCE((notification_preferences->>'push')::boolean, true),
  'marketing', COALESCE((notification_preferences->>'marketing')::boolean, false),
  'system', COALESCE((notification_preferences->>'system')::boolean, true)
) WHERE notification_preferences IS NULL OR NOT (notification_preferences ? 'email');

-- Ensure ui_preferences has proper structure  
UPDATE user_profiles 
SET ui_preferences = jsonb_build_object(
  'theme', COALESCE(ui_preferences->>'theme', 'system'),
  'language', COALESCE(ui_preferences->>'language', 'no'),
  'dashboard_layout', COALESCE(ui_preferences->>'dashboard_layout', 'default'),
  'preferred_modules', COALESCE(ui_preferences->'preferred_modules', '[]'::jsonb),
  'quick_actions', COALESCE(ui_preferences->'quick_actions', '[]'::jsonb)
) WHERE ui_preferences IS NULL OR NOT (ui_preferences ? 'theme');

-- Ensure feature_overrides exists and is proper object
UPDATE user_profiles 
SET feature_overrides = COALESCE(feature_overrides, '{}'::jsonb)
WHERE feature_overrides IS NULL;

-- Update company_profiles table to match unified model requirements  
ALTER TABLE company_profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS org_number TEXT,
ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise'));

-- Update existing company names from 'name' field if company_name is null
UPDATE company_profiles 
SET company_name = name 
WHERE company_name IS NULL AND name IS NOT NULL;

-- Ensure company notification_preferences has proper structure
UPDATE company_profiles 
SET notification_preferences = jsonb_build_object(
  'email', COALESCE((notification_preferences->>'email')::boolean, true),
  'sms', COALESCE((notification_preferences->>'sms')::boolean, false),
  'webhook', notification_preferences->>'webhook',
  'slack', notification_preferences->>'slack'
) WHERE notification_preferences IS NULL OR NOT (notification_preferences ? 'email');

-- Ensure company ui_preferences has proper branding structure
UPDATE company_profiles 
SET ui_preferences = jsonb_build_object(
  'branding', jsonb_build_object(
    'logo_url', ui_preferences->'branding'->>'logo_url',
    'primary_color', ui_preferences->'branding'->>'primary_color',
    'secondary_color', ui_preferences->'branding'->>'secondary_color'
  ),
  'dashboard_config', jsonb_build_object(
    'default_view', COALESCE(ui_preferences->'dashboard_config'->>'default_view', 'overview'),
    'widgets', COALESCE(ui_preferences->'dashboard_config'->'widgets', '[]'::jsonb)
  )
) WHERE ui_preferences IS NULL OR NOT (ui_preferences ? 'branding');

-- Create ModuleMetadata table for plugin-driven architecture
CREATE TABLE IF NOT EXISTS module_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  version TEXT NOT NULL,
  dependencies TEXT[] DEFAULT '{}',
  feature_flags JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  module_type TEXT NOT NULL DEFAULT 'plugin' CHECK (module_type IN ('core', 'plugin', 'integration')),
  entry_point TEXT NOT NULL,
  config_schema JSONB,
  permissions_required TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FeatureFlags table for role-based feature rollout
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles TEXT[] DEFAULT '{}',
  target_companies UUID[],
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE module_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_metadata (read-only for most users, admin can modify)
CREATE POLICY "Anyone can view active modules" 
ON module_metadata FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage modules" 
ON module_metadata FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND (up.metadata->>'role' IN ('admin', 'master_admin') OR up.metadata->>'internal_admin' = 'true')
  )
);

-- RLS Policies for feature_flags (read-only for most users, admin can modify) 
CREATE POLICY "Users can view enabled feature flags" 
ON feature_flags FOR SELECT 
USING (is_enabled = true);

CREATE POLICY "Admins can manage feature flags" 
ON feature_flags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND (up.metadata->>'role' IN ('admin', 'master_admin') OR up.metadata->>'internal_admin' = 'true')
  )
);

-- Insert default modules for the platform
INSERT INTO module_metadata (name, description, version, entry_point, module_type, active) VALUES
('bytt-leads', 'Lead generation and comparison engine (Bytt.no style)', '1.0.0', '/modules/bytt-leads', 'core', true),
('boligmappa-docs', 'Home documentation and maintenance (Boligmappa.no style)', '1.0.0', '/modules/boligmappa-docs', 'core', true),
('propr-diy', 'DIY home-selling flow (Propr.no style)', '1.0.0', '/modules/propr-diy', 'core', true),
('admin-panel', 'Administrative panel and user management', '1.0.0', '/modules/admin-panel', 'core', true),
('analytics', 'User behavior analytics and insights', '1.0.0', '/modules/analytics', 'plugin', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage, target_roles) VALUES
('advanced_search', 'Advanced property search functionality', true, 100, ARRAY['user', 'company', 'admin']),
('ai_recommendations', 'AI-powered property recommendations', false, 25, ARRAY['user', 'company']),
('bulk_operations', 'Bulk operations for leads and properties', true, 100, ARRAY['company', 'admin']),
('white_label', 'White label customization options', true, 100, ARRAY['company']),
('advanced_analytics', 'Advanced analytics and reporting', true, 100, ARRAY['admin', 'master_admin'])
ON CONFLICT (name) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_module_metadata_updated_at
  BEFORE UPDATE ON module_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();