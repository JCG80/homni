
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthUser, Profile } from '../types/types';
import { useAuthSession } from './useAuthSession';
import { useAuthDerivedState } from './useAuthDerivedState';
import { UserRole } from '../utils/roles/types';
import { useDevAuth } from './useDevAuth';
import { supabase } from '@/integrations/supabase/client';

// Define a type for module access
export interface ModuleAccess {
  system_module_id: string;
  internal_admin?: boolean;
}

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
  module_access: ModuleAccess[]; // Make this required
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
  module_access: [], // Default empty array
  internal_admin: false,
  canAccessModule: () => false,
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get the auth session state
  const authSession = useAuthSession();
  const [moduleAccess, setModuleAccess] = useState<ModuleAccess[]>([]);
  
  // Get dev auth functionality (only works in development)
  const devAuth = useDevAuth();
  
  // Use dev user instead of real auth in development mode
  const effectiveUser = devAuth.isDevMode ? devAuth.devUser : authSession.user;
  const effectiveProfile = devAuth.isDevMode ? devAuth.devUserProfile : authSession.profile;
  
  // Fetch module access when user changes
  useEffect(() => {
    const fetchModuleAccess = async () => {
      if (!effectiveUser?.id) return;
      
      try {
        const { data: accessData, error: accessError } = await supabase
          .from('module_access')
          .select('system_module_id, internal_admin')
          .eq('user_id', effectiveUser.id);
          
        if (accessError) {
          console.error('Error fetching module access:', accessError);
          return;
        }
        
        setModuleAccess(accessData || []);
      } catch (error) {
        console.error('Unexpected error fetching module access:', error);
      }
    };
    
    // Only fetch module access for real users, not dev users
    if (effectiveUser && !devAuth.isDevMode) {
      fetchModuleAccess();
    } else if (devAuth.isDevMode && devAuth.devUser) {
      // For dev users, set some sample module access
      setModuleAccess([{ system_module_id: 'dev-module', internal_admin: true }]);
    } else {
      // Reset module access when no user
      setModuleAccess([]);
    }
  }, [effectiveUser?.id, devAuth.isDevMode, devAuth.devUser]);
  
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
    
    const result = await authSession.refreshProfile();
    
    // After refreshing profile, also refresh module access
    if (effectiveUser?.id) {
      try {
        const { data: accessData, error: accessError } = await supabase
          .from('module_access')
          .select('system_module_id, internal_admin')
          .eq('user_id', effectiveUser.id);
          
        if (!accessError) {
          setModuleAccess(accessData || []);
        }
      } catch (error) {
        console.error('Error refreshing module access:', error);
      }
    }
    
    return result;
  };
  
  // Combine the states for the context value
  const contextValue = {
    ...authSession,
    ...derivedState,
    user: effectiveUser,
    profile: effectiveProfile,
    refreshProfile,
    module_access: moduleAccess, // Include module access in context
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
