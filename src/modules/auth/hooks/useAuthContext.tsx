
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useRoleCheck } from './roles/useRoleCheck';
import { signOut } from '../api/auth-authentication';
import { useDevAuth } from './useDevAuth';
import { AuthContextType } from '../types/types';

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  loading: true,
  isLoading: true,
  error: null,
  isAdmin: false,
  isMasterAdmin: false,
  isCompany: false,
  isMember: false,
  isContentEditor: false,
  isAnonymous: true,
  hasRole: () => false,
  canAccess: () => false, // Keep this for backward compatibility
  canAccessModule: () => false,
  canPerform: () => false,
  refreshProfile: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthState();
  const roleChecks = useRoleCheck();
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
  
  // Implement synchronous canAccessModule
  const canAccessModuleSync = (moduleId: string): boolean => {
    // If user is master admin or has internal admin role, allow access to everything
    if (roleChecks.isMasterAdmin || (authState.profile?.metadata?.internal_admin === true)) {
      return true;
    }
    
    // Check if module access is in the profile metadata
    const modulesAccess = authState.profile?.metadata?.modules_access || [];
    return modulesAccess.includes(moduleId);
  };
  
  // Create the combined context value
  const value: AuthContextType = {
    ...authState, // Provides user, profile, isLoading, error, etc.
    ...roleChecks, // Provides role, isAdmin, isMasterAdmin, hasRole, etc.
    loading: authState.isLoading, // Alias for backward compatibility
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

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};
