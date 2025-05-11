
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
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return <div>Loading authentication state...</div>;
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
    if (!role || !requiredRoles.includes(role)) {
      return <>{fallback}</>;
    }
  }

  // User is authenticated and has required role if any
  return <>{children}</>;
};
