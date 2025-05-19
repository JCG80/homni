
import { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from './useAuthState';
import { useRoleCheck } from './roles/useRoleCheck';
import { useDevAuth } from './useDevAuth';
import { signOut } from '../api/auth-authentication';

// Create a unified auth context type that includes all properties
export interface AuthContextType {
  // User state
  user: any | null;
  profile: any | null;
  
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
  canPerform: (action: string, resource: string) => boolean;
  
  // Profile management
  refreshProfile: () => Promise<void>;
  
  // Authentication methods
  logout: () => Promise<void>;
  
  // Development features
  isDevMode?: boolean;
  switchDevUser?: (profileId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();
  const roleCheck = useRoleCheck();
  const devAuth = useDevAuth();
  
  // Add the logout function implementation
  const logout = async () => {
    console.log('Logging out user');
    try {
      await signOut();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Create a wrapper for refreshProfile that returns void
  const refreshProfileWrapper = async (): Promise<void> => {
    if (authState.refreshProfile) {
      await authState.refreshProfile();
    }
  };
  
  // Convert the async canAccessModule to a synchronous one with caching
  const canAccessModuleSync = (moduleId: string): boolean => {
    // If user is master admin or has internal admin role, allow access to everything
    if (roleCheck.isMasterAdmin || (authState.profile?.metadata?.internal_admin === true)) {
      return true;
    }
    
    // Check if the user has access to the module in their profile
    const modulesAccess = authState.profile?.metadata?.modules_access || [];
    return modulesAccess.includes(moduleId);
  };
  
  // Merge the contexts
  const mergedContext: AuthContextType = {
    ...authState,
    ...roleCheck,
    loading: authState.isLoading, // Alias for backward compatibility
    canAccess: canAccessModuleSync, // For backward compatibility
    canAccessModule: canAccessModuleSync,
    canPerform: (action: string, resource: string) => false, // Stub implementation
    logout, // Add the logout function to the context
    refreshProfile: refreshProfileWrapper,
    isDevMode: devAuth.isDevMode,
    switchDevUser: devAuth.switchToDevUser,
  };
  
  return (
    <AuthContext.Provider value={mergedContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
