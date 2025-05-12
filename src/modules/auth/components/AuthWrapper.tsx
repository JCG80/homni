
import React, { ReactNode } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

interface AuthWrapperProps {
  children: ReactNode;
}

/**
 * AuthWrapper component that provides authentication context to its children
 * This is a wrapper component that should be used at the root of the application
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { AuthProvider } = useAuthContext();
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
