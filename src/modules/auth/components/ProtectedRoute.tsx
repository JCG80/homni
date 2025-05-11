
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole, isUserRole, canAccessModule } from '../utils/roles';

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
  const { isAuthenticated, user, profile, isLoading } = useAuth();
  const location = useLocation();

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
  
  // Determine the current role - use profile role first, then user role, default to 'anonymous'
  const currentRole: UserRole = profile?.role ?? user?.role ?? 'anonymous';
  
  console.log('ProtectedRoute check - isAuthenticated:', isAuthenticated, 'role:', currentRole, 
    'allowedRoles:', allowedRoles, 'allowAnyAuthenticated:', allowAnyAuthenticated,
    'module:', module);
  
  // If module is specified, check if user has access to that module
  if (module) {
    if (!canAccessModule(currentRole, module)) {
      // If anonymous, redirect to login. Otherwise to unauthorized.
      const redirectPath = currentRole === 'anonymous' ? '/login' : '/unauthorized';
      console.log(`User does not have access to module: ${module}, redirecting to: ${redirectPath}`);
      return <Navigate to={redirectPath} replace state={{ from: location }} />;
    }
  }
  
  // If allowAnyAuthenticated is true, require authentication
  if (allowAnyAuthenticated) {
    if (!isAuthenticated) {
      console.log('Authentication required, redirecting to login');
      return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    console.log('allowAnyAuthenticated is true, granting access to authenticated user');
    return <>{children}</>;
  }
  
  // If specific roles are required, check if the user has one of them
  if (allowedRoles.length > 0) {
    // Non-authenticated users automatically don't have the required roles
    if (!isAuthenticated) {
      console.log('Authentication required for specific roles, redirecting to login');
      return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    
    console.log('Role check - Current role:', currentRole, 'Allowed roles:', allowedRoles);
    
    if (!allowedRoles.includes(currentRole)) {
      console.error('Access denied. User role:', currentRole, 'Required roles:', allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If we get here, access is granted
  return <>{children}</>;
};
