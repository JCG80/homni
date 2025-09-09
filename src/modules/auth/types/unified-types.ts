/**
 * Unified auth module types that match the database schema
 */

/**
 * Standard user roles in the application - now matches database app_role enum
 */
export type UserRole = 
  | 'guest'         // Not logged in (replaces anonymous)
  | 'user'          // Regular user (replaces member) 
  | 'company'       // Company user
  | 'content_editor' // Content editor
  | 'admin'         // Admin user
  | 'master_admin'; // Master admin

/**
 * Unified user profile interface that matches the database schema
 */
export interface UserProfile {
  id: string;
  user_id?: string; // Make optional to handle cases where it's the same as id
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  role?: string; // Legacy field, use user_roles table instead
  account_type?: string; // Legacy field
  company_id?: string;
  display_name?: string; // Add display_name field
  metadata: {
    role?: UserRole;
    company_id?: string;
    account_type?: 'user' | 'company';
    internal_admin?: boolean;
    [key: string]: any;
  };
  preferences?: Record<string, any>;
  notification_preferences?: Record<string, any>;
  ui_preferences?: Record<string, any>;
  feature_overrides?: Record<string, any>;
}

// CompanyProfile moved to src/types/company.ts to avoid circular dependencies

/**
 * User session information
 */
export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * Module metadata for plugin-driven architecture
 */
export interface ModuleMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  dependencies: string[];
  feature_flags: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Feature flags for role-based feature rollout
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage?: number;
  target_roles?: UserRole[];
  conditions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * User role assignment (separate table for proper role management)
 */
export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

/**
 * Test user interface that matches the format needed for our login components
 */
export interface QuickLoginUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Optional for passwordless login
  company_id?: string;
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  userRoles: UserRoleAssignment[];
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
  hasRoleLevel: (minLevel: number) => boolean;
  
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