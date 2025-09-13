/**
 * Unified Data Models - Core architectural types
 * Part of Homni platform development plan
 */

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  role: 'anonymous' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';
  account_type: 'privatperson' | 'bedrift';
  company_id?: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    system: boolean;
  };
  ui_preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'no' | 'en' | 'se' | 'dk';
    dashboard_layout: string;
    preferred_modules: string[];
    quick_actions: string[];
  };
  feature_overrides: {
    [featureKey: string]: boolean | string | number;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  org_number?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise';
  notification_preferences: {
    email: boolean;
    sms: boolean;
    webhook?: string;
    slack?: string;
  };
  ui_preferences: {
    branding: {
      logo_url?: string;
      primary_color?: string;
      secondary_color?: string;
    };
    dashboard_config: {
      default_view: string;
      widgets: string[];
    };
  };
  feature_overrides: {
    [featureKey: string]: boolean | string | number;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ModuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  feature_flags: {
    [flagKey: string]: boolean | string | number;
  };
  active: boolean;
  module_type: 'core' | 'plugin' | 'integration';
  entry_point: string;
  config_schema?: Record<string, any>;
  permissions_required: string[];
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: UserProfile['role'][];
  target_companies?: string[];
  conditions?: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  company_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Plugin system types
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: string[];
  permissions: string[];
  entry_point: string;
  config_schema?: Record<string, any>;
  hooks: {
    [hookName: string]: string[];
  };
}

export interface PluginContext {
  user: UserProfile;
  company?: CompanyProfile;
  features: FeatureFlag[];
  modules: ModuleMetadata[];
  config: Record<string, any>;
}

export interface PluginHook {
  name: string;
  execute: (context: PluginContext, ...args: any[]) => Promise<any>;
  priority: number;
}

// Module access control
export interface ModuleAccess {
  module_id: string;
  user_id?: string;
  company_id?: string;
  role?: UserProfile['role'];
  permissions: string[];
  restrictions?: {
    [key: string]: any;
  };
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Unified navigation structure
export interface UnifiedNavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
  module_id?: string;
  required_permissions?: string[];
  required_role?: UserProfile['role'];
  feature_flag?: string;
  children?: UnifiedNavigationItem[];
  metadata?: {
    order: number;
    category: string;
    description?: string;
  };
}

// System health and monitoring
export interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  error_rate: number;
  last_check: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  metric_name: string;
  value: number;
  unit: string;
  timestamp: string;
  labels?: Record<string, string>;
}

// Data migration and versioning
export interface MigrationRecord {
  id: string;
  version: string;
  description: string;
  executed_at: string;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
  rollback_available: boolean;
}

// Internationalization
export interface LocalizationEntry {
  key: string;
  locale: 'no' | 'en' | 'se' | 'dk';
  value: string;
  context?: string;
  updated_at: string;
}