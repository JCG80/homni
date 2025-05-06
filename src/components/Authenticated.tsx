
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface AuthenticatedProps {
  children: ReactNode;
}

export const Authenticated = ({ children }: AuthenticatedProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Laster inn...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
