/**
 * DEPRECATED - Use @/types/consolidated-types instead
 * 
 * Legacy index file for backward compatibility.
 * All types are now consolidated in consolidated-types.ts
 */

// Re-export from consolidated types for backward compatibility
export type {
  UserRole,
  NavigationItem,
  NavigationConfig,
  UnifiedNavConfig,
  UserProfile,
  AuthUser,
  QuickLoginUser,
  Lead,
  LeadFormValues,
  LeadStatus,
  PipelineStage,
  BaseComponentProps,
  LoadingState,
  ApiResponse,
  FeatureFlag,
  ModuleAccess,
  AuditLogEntry
} from './consolidated-types';

// Legacy exports for backward compatibility
export * from './auth';
export * from './common';
export * from './leads-canonical';
export * from './hooks';
export * from './admin';
export * from './logging';

// Company types (explicit exports to avoid conflicts)
export type { CompanyProfile, CompanyStatistics, PurchaseRecord } from './company';

// Marketplace types (explicit exports to avoid conflicts)  
export type { BuyerAccount, LeadPackage, LeadAssignment } from './marketplace';