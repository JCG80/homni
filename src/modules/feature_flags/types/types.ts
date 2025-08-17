
import { Database } from '@/integrations/supabase/types';

// Extract types from generated Supabase types
type TablesInsert = Database['public']['Tables'];
type TablesRow = Database['public']['Tables'];

// Feature flag types
export type FeatureFlag = {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number; // Updated to match database schema 
  target_roles: string[] | null;
  created_at: string;
  updated_at: string;
};

export type FeatureFlagInsert = {
  name: string;
  description?: string | null;
  is_enabled?: boolean;
  rollout_percentage?: number; // Updated to match database schema
  target_roles?: string[] | null;
};

export type FeatureFlagUpdate = {
  name?: string;
  description?: string | null;
  is_enabled?: boolean;
  rollout_percentage?: number; // Updated to match database schema
  target_roles?: string[] | null;
};

// Module types
export type UserModule = {
  id: string;
  user_id: string;
  module_id: string;
  is_enabled: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type UserModuleInsert = {
  user_id: string;
  module_id: string;
  is_enabled?: boolean;
  settings?: Record<string, any>;
};

export type UserModuleUpdate = {
  is_enabled?: boolean;
  settings?: Record<string, any>;
};

export type ServiceModule = {
  id: string;
  service_id: string;
  module_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type ServiceModuleInsert = {
  service_id: string;
  module_id: string;
  settings?: Record<string, any>;
};

export type ServiceModuleUpdate = {
  settings?: Record<string, any>;
};

export type ModuleDependency = {
  id: string;
  module_id: string;
  dependency_id: string;
  relationship_type: string;
  created_at: string;
  updated_at: string;
};

export type ModuleDependencyInsert = {
  module_id: string;
  dependency_id: string;
  relationship_type?: string;
};

export type ModuleDependencyUpdate = {
  relationship_type?: string;
};

// Extended SystemModule type that includes the new fields
export type ExtendedSystemModule = TablesRow['system_modules']['Row'] & {
  feature_flags_enabled?: boolean;
  extended_metadata?: Record<string, any>;
};

// Helper type for module relationship
export type ModuleRelationshipType = 'requires' | 'enhances' | 'conflicts' | 'optional';

// Feature preference types that match the JSONB schema
export interface FeaturePreferences {
  enabledExperiments?: string[];
  disabledFeatures?: string[];
  uiPreferences?: Record<string, any>;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  lastSeenFeatures?: Record<string, string>; // feature_name -> ISO timestamp
}
