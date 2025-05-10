
import React, { ReactNode } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { DevQuickLogin } from './DevQuickLogin';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
      <DevQuickLogin />
    </AuthProvider>
  );
};
