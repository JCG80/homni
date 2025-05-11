
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
  const { isAuthenticated, isLoading, user, profile } = useAuth();

  if (isLoading) {
    return <div>Laster autentiseringsstatus...</div>;
  }

  // Determine the current role - use 'anonymous' if not authenticated
  const currentRole: UserRole = profile?.role ?? user?.role ?? 'anonymous';
  
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
    if (!requiredRoles.includes(currentRole)) {
      return <>{fallback}</>;
    }
  }

  // User is authenticated and has required role if any
  return <>{children}</>;
};
