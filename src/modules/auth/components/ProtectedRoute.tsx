
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  allowAnyAuthenticated?: boolean; // New prop to allow any authenticated user
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], // Make this optional with empty array default
  redirectTo = '/login',
  allowAnyAuthenticated = false // Default to false for backward compatibility
}: ProtectedRouteProps) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Sjekker tilgangsrettigheter...</p>
        </div>
      </div>
    );
  }
  
  console.log('ProtectedRoute check - isAuthenticated:', isAuthenticated, 'role:', role, 
    'allowedRoles:', allowedRoles, 'allowAnyAuthenticated:', allowAnyAuthenticated);
  
  // First check if user is authenticated at all
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // If allowAnyAuthenticated is true, grant access to any authenticated user
  if (allowAnyAuthenticated) {
    console.log('allowAnyAuthenticated is true, granting access to authenticated user');
    return <>{children}</>;
  }
  
  // If no specific roles are required, or if the array is empty, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('No specific roles required, granting access');
    return <>{children}</>;
  }
  
  console.log('Role check - Current role:', role, 'Allowed roles:', allowedRoles);
  
  if (!role || !allowedRoles.includes(role as UserRole)) {
    console.error('Access denied. User role:', role, 'Required roles:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
