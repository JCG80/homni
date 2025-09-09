/**
 * Centralized type definitions for the Homni platform
 * This file serves as the single source of truth for all types
 */

// Core domain types
export * from './auth';
export * from './common';
export * from './leads-canonical';
export * from './hooks';
export * from './admin';
export * from './logging';

// Marketplace types (explicit exports to avoid conflicts)
export type { BuyerAccount, LeadPackage, LeadAssignment } from './marketplace';

// Legacy compatibility exports
export type { UserRole, UserProfile, AuthUser, QuickLoginUser } from './auth';
export type { Lead, LeadFormValues, LeadStatus, PipelineStage, CompanyProfile } from './leads-canonical';

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