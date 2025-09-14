import React, { ReactNode } from 'react';
import { useAuthState } from '../hooks/useAuthState';
import { useRoleCheck } from '../hooks/roles/useRoleCheck';
import { signOut } from '../api/auth-authentication';
import { useDevAuth } from '../hooks/useDevAuth';
import { useModuleAccessQuery } from '../hooks/useModuleAccessQuery';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from '@/types/auth';
import { logger } from '@/utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component that provides authentication context to the app
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  console.log('[EMERGENCY AuthProvider] Starting auth provider initialization');
  const authState = useAuthState();
  console.log('[EMERGENCY AuthProvider] Got auth state:', { 
    isLoading: authState.isLoading,
    hasUser: !!authState.user,
    role: authState.role 
  });
  
  const roleChecks = useRoleCheck({ role: authState.role });
  const devAuth = useDevAuth();
  
  // FIXED: Pass user directly to avoid circular dependency
  const moduleAccessQuery = useModuleAccessQuery({ user: authState.user });
  
  logger.info('AuthProvider role properly connected', {
    authStateRole: authState.role,
    roleChecksAdmin: roleChecks.isAdmin,
    roleChecksMasterAdmin: roleChecks.isMasterAdmin
  });
  
  // Add the logout function implementation
  const logout = async () => {
    logger.info('Logging out user');
    try {
      await signOut();
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Error logging out', { error });
    }
  };

  // Create a wrapper for refreshProfile that returns void
  const refreshProfileWrapper = async (): Promise<void> => {
    if (authState.refreshProfile) {
      await authState.refreshProfile();
      // Refetch module access after profile refresh
      moduleAccessQuery.refetch();
    }
  };
  
  // Implement synchronous canAccessModule using database data
  const canAccessModuleSync = (moduleId: string): boolean => {
    // If user is master admin, allow access to everything
    if (roleChecks.isMasterAdmin) {
      return true;
    }
    
    // Check internal admin from database query
    if (moduleAccessQuery.data?.isInternalAdmin === true) {
      return true;
    }
    
    // Check module access from database query
    const modulesAccess = moduleAccessQuery.data?.moduleAccess || [];
    return modulesAccess.includes(moduleId);
  };
  
  // Create the combined context value
  const value: AuthContextType = {
    ...authState, // Provides user, profile, isLoading, error, etc.
    ...roleChecks, // Provides role, isAdmin, isMasterAdmin, hasRole, etc.
    role: authState.role, // Explicitly set role from authState
    loading: authState.isLoading || moduleAccessQuery.isLoading, // Include module access loading
    canAccessModule: canAccessModuleSync, 
    canAccess: canAccessModuleSync, // Alias for backward compatibility
    canPerform: (action: string, resource: string) => false, // Stub implementation
    logout, // Add the logout function to the context value
    refreshProfile: refreshProfileWrapper, // Use the wrapper function
    isDevMode: devAuth.isDevMode,
    switchDevUser: devAuth.switchToDevUser,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};