/**
 * Authentication and user-related types
 * Uses canonical roles from normalizeRole.ts
 */

// Import and re-export canonical types from normalizeRole
import type { UserRole as CanonicalUserRole } from '@/modules/auth/normalizeRole';
import { normalizeRole, isLegacyRole, getRoleDisplayName, getRoleLevel, hasRoleLevel, isUserRole as isUserRoleCanonical } from '@/modules/auth/normalizeRole';

// Import UserProfile for internal use
import type { UserProfile } from '@/modules/auth/types/unified-types';

export type UserRole = CanonicalUserRole;
export { normalizeRole, isLegacyRole, getRoleDisplayName, getRoleLevel, hasRoleLevel };

// Re-export constants from canonical source
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES } from '@/modules/auth/normalizeRole';

// Re-export UserProfile for external consumers
export type { UserProfile };

/**
 * User session information
 */
export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * Test user interface for development and testing
 */
export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  company_id?: string;
}

/**
 * Quick login user interface
 */
export interface QuickLoginUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  company_id?: string;
}

/**
 * Development user profile interface
 */
export interface DevUserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  company_id?: string;
}

/**
 * Auth state interface - uses imported UserProfile from unified-types
 */
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  refreshProfile: () => Promise<void>;
}

/**
 * Auth context interface
 */
export interface AuthContextType extends AuthState {
  // Derived state
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  isContentEditor: boolean;
  isGuest: boolean;
  
  // Aliases for backward compatibility
  loading: boolean;
  
  // Role checking methods
  hasRole: (role: UserRole | UserRole[]) => boolean;
  
  // Access control methods
  canAccessModule: (moduleId: string) => boolean;
  canAccess: (moduleId: string) => boolean;
  canPerform: (action: string, resource: string) => boolean;
  
  // Auth methods
  logout: () => Promise<void>;
  
  // Development features
  isDevMode?: boolean;
  switchDevUser?: (profileId: string) => void;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  requiresAuth?: boolean;
  roles?: UserRole[];
  allowAnyRole?: boolean;
  module?: string;
}

/**
 * Module access interface
 */
export interface ModuleAccess {
  id: string;
  user_id: string;
  system_module_id: string;
  internal_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type guard to check if a string is a valid UserRole
 * @deprecated Use isUserRoleCanonical from @/modules/auth/normalizeRole instead
 */
export function isUserRole(role: any): role is UserRole {
  return isUserRoleCanonical(role);
}