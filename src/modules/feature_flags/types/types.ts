
import { Database } from '@/integrations/supabase/types';

// Extract types from generated Supabase types
type TablesInsert = Database['public']['Tables'];
type TablesRow = Database['public']['Tables'];

// Feature flag types
export type FeatureFlag = TablesRow['feature_flags']['Row'];
export type FeatureFlagInsert = TablesInsert['feature_flags']['Insert'];
export type FeatureFlagUpdate = TablesInsert['feature_flags']['Update'];

// Module types
export type UserModule = TablesRow['user_modules']['Row'];
export type UserModuleInsert = TablesInsert['user_modules']['Insert'];
export type UserModuleUpdate = TablesInsert['user_modules']['Update'];

export type ServiceModule = TablesRow['service_modules']['Row'];
export type ServiceModuleInsert = TablesInsert['service_modules']['Insert'];
export type ServiceModuleUpdate = TablesInsert['service_modules']['Update'];

export type ModuleDependency = TablesRow['module_dependencies']['Row'];
export type ModuleDependencyInsert = TablesInsert['module_dependencies']['Insert'];
export type ModuleDependencyUpdate = TablesInsert['module_dependencies']['Update'];

// Extended SystemModule type that includes the new fields
export interface ExtendedSystemModule extends TablesRow['system_modules']['Row'] {
  feature_flags_enabled?: boolean;
  extended_metadata?: Record<string, any>;
}

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
