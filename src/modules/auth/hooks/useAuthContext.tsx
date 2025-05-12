
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useRoleCheck } from './roles/useRoleCheck';

interface AuthContextType {
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
  canAccess: (moduleId: string) => boolean;
  canPerform: (action: string, resource: string) => boolean;
  canAccessModule: (moduleId: string) => boolean;
  
  // Profile management
  refreshProfile: () => Promise<void>;
  
  // Development features
  isDevMode?: boolean;
  switchDevUser?: (profileId: string) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
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
  canAccess: () => false,
  canPerform: () => false,
  canAccessModule: () => false,
  refreshProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthState();
  const roleChecks = useRoleCheck();
  
  // Create the combined context value
  const value: AuthContextType = {
    ...authState, // Provides user, profile, isLoading, error, refreshProfile, etc.
    ...roleChecks, // Provides role, isAdmin, isMasterAdmin, hasRole, etc.
    loading: authState.isLoading, // Alias for backward compatibility
    canAccess: roleChecks.canAccessModule, // Rename for backward compatibility
    canPerform: (action: string, resource: string) => false, // Stub implementation
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
  
  return { ...context, AuthProvider };
};
