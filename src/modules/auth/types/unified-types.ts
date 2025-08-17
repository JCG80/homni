
/**
 * Unified auth module types that match the database schema
 */

/**
 * Standard user roles in the application
 */
export type UserRole = 
  | 'guest'         // Not logged in (canonical for anonymous)
  | 'user'          // Regular user (canonical for member) 
  | 'company'       // Company user
  | 'content_editor' // Content editor
  | 'admin'         // Admin user
  | 'master_admin'; // Master admin

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
    account_type?: 'user' | 'company';
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
