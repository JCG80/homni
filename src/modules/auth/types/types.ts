
/**
 * Core auth module types
 */

// Import UserRole from the new location
import { UserRole } from '../utils/roles/types';

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

export interface Profile {
  id: string;
  full_name?: string;
  role: UserRole;
  company_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  profile_picture_url?: string;
  preferences?: Record<string, any>;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  company_id?: string; // Added company_id to fix issues
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
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
  password: string;
  company_id?: string;
}

// Extended Auth Context Type with both canAccess and canAccessModule for backwards compatibility
export interface AuthContextType {
  // User state
  user: AuthUser | null;
  profile: Profile | null;
  
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
  isMember: boolean;
  isContentEditor: boolean;
  isAnonymous: boolean;
  
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
