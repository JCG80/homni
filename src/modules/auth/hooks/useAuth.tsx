
import { createContext, ReactNode, useContext } from 'react';
import { AuthUser, Profile } from '../types/types';
import { useAuthState } from './useAuthState';

interface AuthContextType {
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
  role: string | undefined;
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
  // Use all values directly from useAuthState
  const authData = useAuthState();
  
  // Map the values from authState to match the AuthContextType
  const authContextValue: AuthContextType = {
    user: authData.user,
    profile: authData.profile,
    isLoading: authData.isLoading,
    error: authData.error,
    refreshProfile: authData.refreshProfile,
    isAuthenticated: authData.isAuthenticated,
    isAdmin: authData.isAdmin,
    isMasterAdmin: authData.isMasterAdmin,
    isCompany: authData.isCompany,
    isUser: authData.isUser,
    role: authData.role,
  };
  
  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// Named export for the useAuth hook
export const useAuth = () => useContext(AuthContext);

// Default export for backward compatibility
export default useAuth;
