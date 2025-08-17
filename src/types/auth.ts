/**
 * Authentication and user-related types
 */

/**
 * Standard user roles in the application
 */
export type UserRole = 
  | 'anonymous'     // Not logged in
  | 'member'        // Regular user (previously 'user')
  | 'company'       // Company user
  | 'content_editor' // Content editor
  | 'admin'         // Admin user
  | 'master_admin'; // Master admin

/**
 * All possible roles in the system
 */
export const ALL_ROLES: UserRole[] = [
  'anonymous',
  'member',
  'company',
  'admin',
  'master_admin',
  'content_editor'
];

/**
 * Public-facing roles
 */
export const PUBLIC_ROLES: UserRole[] = [
  'anonymous'
];

/**
 * Roles that require authentication
 */
export const AUTHENTICATED_ROLES: UserRole[] = [
  'member',
  'company',
  'admin',
  'master_admin',
  'content_editor'
];

/**
 * Unified user profile interface that matches the database schema
 */
export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at?: string;
  metadata: {
    role?: UserRole;
    company_id?: string;
    account_type?: 'member' | 'company';
    internal_admin?: boolean;
    [key: string]: any;
  };
  preferences?: Record<string, any>;
}

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
 * Auth state interface
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
  isMember: boolean;
  isContentEditor: boolean;
  isAnonymous: boolean;
  
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
 */
export function isUserRole(role: any): role is UserRole {
  return ALL_ROLES.includes(role);
}