/**
 * Consolidated service and category types to prevent duplicates
 */

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parent_category?: string;
  subcategories?: string[];
  is_popular: boolean;
  popular?: boolean; // Alias for backward compatibility
  average_price_range?: string;
  roles?: string[];
}

export interface ServiceInfo {
  id: string;
  name: string;
  category: string;
  description?: string;
  price_range?: string;
}

export interface LeadSubmissionPreferences {
  preferred_categories: string[];
  default_contact_method: 'email' | 'phone' | 'sms';
  notification_preferences: {
    email_updates: boolean;
    sms_updates: boolean;
    push_notifications: boolean;
    assignment_alerts: boolean;
    status_updates: boolean;
  };
  location_preferences: {
    default_location?: string;
    search_radius_km?: number;
    include_remote_services: boolean;
  };
  budget_preferences: {
    typical_budget_range?: string;
    currency: 'NOK' | 'EUR' | 'USD';
    show_budget_in_requests: boolean;
  };
}