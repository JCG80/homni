/**
 * Unified Data Models - Complete Implementation
 * Combines Bytt.no × Boligmappa.no × Propr.no platform architecture
 */

// ============= CORE USER & COMPANY MODELS =============

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  role: 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';
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

// ============= PLUGIN & MODULE SYSTEM =============

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

// ============= BYTT.NO - LEAD GENERATION MODULE =============

export interface LeadComparison {
  id: string;
  user_id?: string;
  session_id?: string;
  property_type: string;
  location: string;
  services_needed: string[];
  budget_range: {
    min: number;
    max: number;
  };
  urgency: 'immediate' | 'within_week' | 'within_month' | 'flexible';
  comparison_data: {
    providers: LeadProvider[];
    selected_provider?: string;
    comparison_metrics: Record<string, any>;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LeadProvider {
  id: string;
  company_id: string;
  service_category: string;
  pricing_model: 'fixed' | 'hourly' | 'project' | 'subscription';
  base_price: number;
  rating: number;
  reviews_count: number;
  coverage_areas: string[];
  specializations: string[];
  certifications: string[];
  availability: {
    response_time: string;
    booking_slots: string[];
  };
  metadata: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ============= BOLIGMAPPA.NO - HOME DOCUMENTATION MODULE =============

export interface PropertyDocument {
  id: string;
  property_id: string;
  user_id: string;
  document_type: 'warranty' | 'manual' | 'receipt' | 'certificate' | 'photo' | 'video' | 'other';
  title: string;
  description?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  category: string;
  tags: string[];
  maintenance_related: boolean;
  expiration_date?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  property_id: string;
  user_id: string;
  task_template_id?: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue';
  estimated_cost?: number;
  actual_cost?: number;
  scheduled_date?: string;
  completed_date?: string;
  recurring_frequency?: 'monthly' | 'quarterly' | 'annually' | 'custom';
  next_due_date?: string;
  assigned_contractor?: string;
  documentation: {
    before_photos: string[];
    after_photos: string[];
    receipts: string[];
    notes: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PropertyProfile {
  id: string;
  user_id: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    region: string;
    country: string;
  };
  property_details: {
    type: 'apartment' | 'house' | 'townhouse' | 'cabin' | 'commercial' | 'other';
    year_built: number;
    size_sqm: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    energy_rating?: string;
    heating_type: string[];
  };
  ownership: {
    ownership_type: 'owned' | 'rented' | 'cooperative' | 'shared';
    purchase_date?: string;
    purchase_price?: number;
    mortgage_info?: Record<string, any>;
  };
  systems: {
    electrical: Record<string, any>;
    plumbing: Record<string, any>;
    heating: Record<string, any>;
    insulation: Record<string, any>;
    security: Record<string, any>;
  };
  maintenance_preferences: {
    notification_frequency: 'weekly' | 'monthly' | 'quarterly';
    preferred_contractors: string[];
    budget_alerts: boolean;
    seasonal_reminders: boolean;
  };
  created_at: string;
  updated_at: string;
}

// ============= PROPR.NO - DIY SELLING MODULE =============

export interface PropertyListing {
  id: string;
  property_id: string;
  user_id: string;
  listing_type: 'sale' | 'rent' | 'preview';
  status: 'draft' | 'active' | 'pending' | 'sold' | 'expired' | 'withdrawn';
  pricing: {
    asking_price: number;
    price_per_sqm: number;
    shared_cost?: number;
    price_history: Array<{
      price: number;
      date: string;
      reason: string;
    }>;
  };
  marketing: {
    title: string;
    description: string;
    key_features: string[];
    photos: Array<{
      url: string;
      caption: string;
      order: number;
      room_type?: string;
    }>;
    virtual_tour_url?: string;
    floor_plans: string[];
  };
  viewing: {
    viewing_type: 'open_house' | 'private' | 'virtual' | 'hybrid';
    viewing_schedule: Array<{
      date: string;
      start_time: string;
      end_time: string;
      type: string;
      max_attendees?: number;
    }>;
    viewing_instructions?: string;
  };
  legal: {
    property_report_url?: string;
    energy_certificate_url?: string;
    zoning_info: Record<string, any>;
    deed_restrictions: string[];
    disclosure_items: Array<{
      item: string;
      disclosed: boolean;
      details?: string;
    }>;
  };
  marketing_performance: {
    views: number;
    inquiries: number;
    viewings_scheduled: number;
    viewings_completed: number;
    offers_received: number;
  };
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface DIYSellingGuide {
  id: string;
  user_id: string;
  property_id: string;
  current_step: number;
  completed_steps: number[];
  guide_data: {
    property_evaluation: {
      market_analysis: Record<string, any>;
      comparable_properties: Record<string, any>[];
      suggested_price_range: {
        min: number;
        max: number;
        recommended: number;
      };
    };
    preparation_checklist: Array<{
      task: string;
      category: string;
      priority: 'high' | 'medium' | 'low';
      completed: boolean;
      due_date?: string;
      cost_estimate?: number;
    }>;
    legal_requirements: {
      required_documents: string[];
      disclosure_obligations: string[];
      regulatory_compliance: Record<string, any>;
    };
    marketing_plan: {
      channels: string[];
      timeline: Record<string, any>;
      budget_allocation: Record<string, any>;
    };
  };
  created_at: string;
  updated_at: string;
}

// ============= UNIFIED NAVIGATION & ACCESS CONTROL =============

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

// ============= SYSTEM MONITORING & HEALTH =============

export interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  error_rate: number;
  last_check: string;
  metadata?: Record<string, any>;
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

// ============= PLUGIN SYSTEM INTERFACES =============

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

// ============= ANALYTICS & INSIGHTS =============

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id: string;
  event_type: string;
  event_name: string;
  properties: Record<string, any>;
  module_context?: string;
  created_at: string;
}

export interface PerformanceMetric {
  metric_name: string;
  value: number;
  unit: string;
  timestamp: string;
  labels?: Record<string, string>;
}

// ============= INTERNATIONALIZATION =============

export interface LocalizationEntry {
  key: string;
  locale: 'no' | 'en' | 'se' | 'dk';
  value: string;
  context?: string;
  updated_at: string;
}