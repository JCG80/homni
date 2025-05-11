
import { createContext, ReactNode, useContext } from 'react';
import { AuthUser, Profile } from '../types/types';
import { useAuthState as useUnifiedAuthState } from './useAuthState.unified';
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
  // Get the auth state from useAuthState
  const { 
    user,
    profile,
    isLoading,
    error,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    role 
  } = useUnifiedAuthState();
  
  // Map the values directly from useAuthState to match the AuthContextType
  const authContextValue: AuthContextType = {
    user,
    profile,
    isLoading,
    error,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    role,
  };
  
  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// Named export for the useAuth hook
export const useAuth = () => useContext(AuthContext);

// Default export for backward compatibility
export default useAuth;
