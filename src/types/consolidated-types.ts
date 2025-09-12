/**
 * CONSOLIDATED TYPES - Single Source of Truth
 * Eliminates duplicate type definitions across the project
 */

// Re-export canonical types from their authoritative sources
export type { UserRole } from '@/modules/auth/normalizeRole';
export type { 
  NavigationItem,
  NavigationSection,
  NavigationConfig,
  UnifiedNavConfig,
  NavigationPreferences,
  QuickAction,
  EnhancedNavigationItem,
  NavigationSuggestion,
  ContextualNavigationState,
  MobileNavigationProps,
  RoleBasedNavigationProps,
  NavigationCache,
  SmartNavigationHook,
  NavigationConsolidationReport,
  StepNavigationButtonsProps,
  InsuranceStepNavigationProps,
  AuthenticatedNavigationProps
} from '@/types/navigation-consolidated';

export type { 
  UserProfile,
  AuthUser,
  QuickLoginUser,
  UserRoleAssignment 
} from '@/modules/auth/types/unified-types';

export type {
  Lead,
  LeadFormValues,
  LeadStatus,
  PipelineStage
} from '@/types/leads-canonical';

// Import for use in interface definitions
import type { UserRole as ImportedUserRole } from '@/modules/auth/normalizeRole';

// Common component props that are used throughout the app
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Feature flag types
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetRoles?: ImportedUserRole[];
  createdAt: string;
  updatedAt: string;
}

// Module access types
export interface ModuleAccess {
  moduleId: string;
  roles: ImportedUserRole[];
  featureFlag?: string;
  description?: string;
}

// Audit log types
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}