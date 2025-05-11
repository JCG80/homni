
/**
 * Core auth module types
 */

// Import UserRole from the new location
import { UserRole } from '../utils/roles/types';
import { ModuleAccess } from '../hooks/useAuth';

export type { UserRole };

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

// Add test user type for easier management of test users
export interface TestUser {
  email: string;
  role: UserRole;
  password: string;
  name: string;
}
