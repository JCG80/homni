
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

// Extended component type that includes our custom properties
type ComponentWithAuthRequirements = React.ComponentType<any> & {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
};

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

// Helper function to get allowed roles from a component
export const getAuthRequirements = (Component: ComponentWithAuthRequirements) => {
  return {
    requireAuth: Component.requireAuth === true,
    allowedRoles: Component.allowedRoles || []
  };
};
