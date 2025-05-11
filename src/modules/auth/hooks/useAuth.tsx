
import { createContext, ReactNode, useContext } from 'react';
import { AuthUser, Profile } from '../types/types';
import { useAuthState } from './useAuthState.unified';
import { UserRole } from '../utils/roles/types';

// Define a comprehensive AuthContextType with all required fields
export interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  isMember: boolean;
  role: UserRole | undefined;
  account_type?: string;
  module_access: string[];
  internal_admin: boolean;
  canAccessModule: (module: string) => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  refreshProfile: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isMasterAdmin: false,
  isCompany: false,
  isUser: false,
  isMember: false,
  role: undefined,
  account_type: undefined,
  module_access: [],
  internal_admin: false,
  canAccessModule: () => false,
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get the auth state from the unified hook
  const authState = useAuthState();
  
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

// Named export for the useAuth hook
export const useAuth = () => useContext(AuthContext);

// Default export for backward compatibility
export default useAuth;
