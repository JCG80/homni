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

// Company types (explicit exports to avoid conflicts)
export type { CompanyProfile, CompanyStatistics, PurchaseRecord } from './company';

// Marketplace types (explicit exports to avoid conflicts)
export type { BuyerAccount, LeadPackage, LeadAssignment } from './marketplace';

// Legacy compatibility exports - canonical sources only
export type { UserRole, UserProfile, AuthUser, QuickLoginUser } from './auth';
export type { Lead, LeadFormValues, LeadStatus, PipelineStage } from './leads-canonical';

// Hook types
export type { 
  UseFilterHookProps, 
  UseFilterFetchProps, 
  UseKanbanBoardProps, 
  UseLoginFormProps, 
  UseRoleCheckProps 
} from './hooks';

// Admin types (explicit exports to avoid conflicts)
export type { 
  UseModuleAccessProps, 
  ModuleAccessManagerProps, 
  Module, 
  AdminLog 
} from './admin';