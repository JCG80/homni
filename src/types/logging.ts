/**
 * Enhanced types for structured logging
 */

export interface MetadataEntry {
  key: string;
  value: string | number | boolean | object;
  sensitive?: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface FeatureOverrides {
  [featureName: string]: boolean | string | number;
}

export interface CompanyMetadata {
  organization_number?: string;
  industry?: string;
  employee_count?: number;
  established_year?: number;
  website?: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  preferences?: UserPreferences;
  company_id?: string;
}