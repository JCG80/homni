/**
 * Centralized type definitions for the Homni platform
 * This file serves as the single source of truth for all types
 */

// Core domain types
export * from './auth';
export * from './leads';
export * from './marketplace';
export * from './common';

// Legacy compatibility exports
export type { UserRole, UserProfile, AuthUser, QuickLoginUser } from './auth';
export type { Lead, LeadFormValues, LeadStatus, PipelineStage, CompanyProfile } from './leads';
export type { BuyerAccount, LeadPackage, LeadAssignment } from './marketplace';