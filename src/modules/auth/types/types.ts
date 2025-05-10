
import { UserRole } from '../utils/roles';

export { UserRole };

export interface Profile {
  id: string;
  full_name?: string;
  role: UserRole;
  company_id?: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
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
  password: string;
  role: UserRole;
  name: string;
}
