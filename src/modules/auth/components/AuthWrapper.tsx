
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { setupTestUsers } from '../utils/setupTestUsers';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // In development mode, make the setupTestUsers function available globally
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // @ts-ignore
      window.setupTestUsers = setupTestUsers;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
