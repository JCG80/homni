/**
 * Centralized type definitions for the Homni platform
 * This file serves as the single source of truth for all types
 */

// Core domain types
export * from './auth';
export * from './common';
export * from './leads-canonical';
export * from './marketplace';
export * from './hooks';
export * from './admin';
export * from './logging';

// Legacy compatibility exports
export type { UserRole, UserProfile, AuthUser, QuickLoginUser } from './auth';
export type { Lead, LeadFormValues, LeadStatus, PipelineStage, CompanyProfile } from './leads-canonical';
export type { BuyerAccount, LeadPackage, LeadAssignment } from './marketplace';

// Hook types
export type { 
  UseFilterHookProps, 
  UseFilterFetchProps, 
  UseKanbanBoardProps, 
  UseLoginFormProps, 
  UseRoleCheckProps 
} from './hooks';

// Admin types
export type { 
  UseModuleAccessProps, 
  ModuleAccessManagerProps, 
  Module, 
  AdminLog, 
  CompanyStatistics 
} from './admin';

// Export label constants for clean UI display
export { STATUS_LABELS, PIPELINE_LABELS, LEAD_STATUSES } from './leads-canonical';