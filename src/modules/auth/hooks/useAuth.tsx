
import { createContext, ReactNode, useContext } from 'react';
import { AuthUser, Profile } from '../types/types';
import { useAuthState } from './useAuthState.unified';
import { UserRole } from '../utils/roles';

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
  role: UserRole | undefined;
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
  role: undefined,
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
