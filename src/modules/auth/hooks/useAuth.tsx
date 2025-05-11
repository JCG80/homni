
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { AuthUser, Profile } from '../types/types';
import { useAuthSession } from './useAuthSession';
import { useAuthDerivedState } from './useAuthDerivedState';
import { UserRole } from '../utils/roles/types';
import { useDevAuth } from './useDevAuth';

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
  isMember: boolean;
  role: UserRole | undefined;
  account_type?: string;
  module_access: string[];
  internal_admin: boolean;
  canAccessModule: (module: string) => boolean;
  // Add dev-specific props
  isDevMode?: boolean;
  switchDevUser?: (key: string) => void;
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
  isMember: false,
  role: undefined,
  account_type: undefined,
  module_access: [],
  internal_admin: false,
  canAccessModule: () => false,
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get the auth session state
  const authSession = useAuthSession();
  
  // Get dev auth functionality (only works in development)
  const devAuth = useDevAuth();
  
  // Use dev user instead of real auth in development mode
  const effectiveUser = devAuth.isDevMode ? devAuth.devUser : authSession.user;
  const effectiveProfile = devAuth.isDevMode ? devAuth.devUserProfile : authSession.profile;
  
  // Get derived state like isAdmin, isMember, etc.
  const derivedState = useAuthDerivedState({
    user: effectiveUser,
    profile: effectiveProfile
  });
  
  // Override refresh profile in dev mode
  const refreshProfile = async () => {
    if (devAuth.isDevMode) {
      // No need to refresh in dev mode
      return;
    }
    return authSession.refreshProfile();
  };
  
  // Combine the states for the context value
  const contextValue = {
    ...authSession,
    ...derivedState,
    user: effectiveUser,
    profile: effectiveProfile,
    refreshProfile,
    // Add dev-specific functionality
    isDevMode: devAuth.isDevMode,
    switchDevUser: devAuth.switchToDevUser,
  };
  
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Named export for the useAuth hook
export const useAuth = () => useContext(AuthContext);

// Default export for backward compatibility
export default useAuth;
