
import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/roles';

interface AuthenticatedProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRoles?: UserRole[];
  allowAnyRole?: boolean;
}

export const Authenticated = ({
  children,
  fallback = null,
  requiredRoles = [],
  allowAnyRole = false,
}: AuthenticatedProps) => {
  const { isLoading, isAuthenticated, hasRole } = useAuth();

  if (isLoading) {
    return <div>Laster autentiseringsstatus...</div>;
  }

  // If not authenticated, show fallback
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // If allowAnyRole is true, just check if user is authenticated (which we already did above)
  if (allowAnyRole) {
    return <>{children}</>;
  }

  // If specific roles are required, check if the user has one of them
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(requiredRole => hasRole(requiredRole));
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // User is authenticated and has required role if any
  return <>{children}</>;
};
