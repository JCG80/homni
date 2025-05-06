
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    // You could show a loading component here instead
    return <div>Laster...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
