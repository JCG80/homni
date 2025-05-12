
import { useAuthState } from './useAuthState';
import { useRoleCheck } from './roles/useRoleCheck';
import { useAuthContext } from './useAuthContext';

// Define the ModuleAccess type if it's used in the codebase
export interface ModuleAccess {
  id: string;
  user_id: string;
  system_module_id: string;
  access_level: string;
  internal_admin?: boolean;
  created_at?: string;
}

/**
 * Main hook for authentication and authorization
 * Combines auth state with role checking capabilities
 */
export const useAuth = () => {
  // Get the base auth context (which includes authState and roleChecks)
  const authContext = useAuthContext();
  
  // Return the complete auth functionality
  return authContext;
};
