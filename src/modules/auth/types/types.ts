/**
 * Core auth module types
 */

// Re-export all types from the unified types file
export * from './unified-types';

// Keep the legacy types for backward compatibility
import { UserRole, UserProfile } from './unified-types';

// Re-export UserRole directly for backward compatibility
export type { UserRole };

// Define ModuleAccess type explicitly
export interface ModuleAccess {
  id: string;
  user_id: string;
  system_module_id: string;
  internal_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Profile interface removed - use UserProfile from unified-types.ts instead
// Re-export canonical UserProfile
export type { UserProfile as Profile } from './unified-types';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  company_id?: string; // Added company_id to fix issues
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  requiresAuth?: boolean;
  roles?: UserRole[];
  allowAnyRole?: boolean;
}

// Standardized test user interface that matches database structure
export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Make password optional for password-less login
  company_id?: string;
}

// Extended Auth Context Type with both canAccess and canAccessModule for backwards compatibility
export interface AuthContextType {
  // User state
  user: AuthUser | null;
  profile: UserProfile | null;
  
  // Status flags
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  error: Error | null;
  
  // Role properties
  role: string | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  isContentEditor: boolean;
  isGuest: boolean;
  
  // Role checking methods
  hasRole: (role: string | string[]) => boolean;
  
  // Access control methods
  canAccessModule: (moduleId: string) => boolean;
  canAccess: (moduleId: string) => boolean; // Alias for canAccessModule for backward compatibility
  canPerform: (action: string, resource: string) => boolean;
  
  // Profile management
  refreshProfile: () => Promise<void>;
  
  // Authentication methods
  logout: () => Promise<void>;
  
  // Development features
  isDevMode?: boolean;
  switchDevUser?: (profileId: string) => void;
}
