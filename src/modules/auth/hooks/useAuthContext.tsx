
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useRoleCheck } from './roles';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  role: string | null;
  loading: boolean;
  error: Error | null;
  hasRole: (role: string | string[]) => boolean;
  canAccess: (moduleId: string) => boolean;
  canPerform: (action: string, resource: string) => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  role: null,
  loading: true,
  error: null,
  hasRole: () => false,
  canAccess: () => false,
  canPerform: () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthState();
  const roleChecks = useRoleCheck();
  
  const value = {
    ...authState,
    ...roleChecks
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
  
  return { AuthProvider, ...context };
};
