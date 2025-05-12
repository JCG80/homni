
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/roles/types';
import { useRoleProtection } from '../hooks/roles/useRoleProtection';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  allowAnyAuthenticated?: boolean;
  module?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login',
  allowAnyAuthenticated = false,
  module
}: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, role } = useAuth();
  const { isAllowed, loading } = useRoleProtection({
    allowedRoles,
    redirectTo,
    allowAnyAuthenticated,
    module
  });

  // Add debug logging
  useEffect(() => {
    console.log("ProtectedRoute - Role:", role, 
      "Authenticated:", isAuthenticated, 
      "Allowed roles:", allowedRoles,
      "Any authenticated allowed:", allowAnyAuthenticated);
  }, [role, isAuthenticated, allowedRoles, allowAnyAuthenticated]);

  // Show loading state while checking auth or permissions
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Sjekker tilgangsrettigheter...</p>
        </div>
      </div>
    );
  }
  
  // If user is allowed to access this route, render the children
  if (isAllowed) {
    return <>{children}</>;
  }
  
  // Otherwise this will be handled by the useRoleProtection hook
  // which will redirect appropriately, but we'll return null just in case
  return null;
};
