
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/roles/types';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const { isLoading, isAuthenticated, role, canAccessModule } = useAuth();
  const location = useLocation();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  // Check if user is allowed to access this route
  useEffect(() => {
    const checkAccess = async () => {
      setIsCheckingPermission(true);
      
      // Wait for auth to initialize
      if (isLoading) return;
      
      // If not authenticated and this is a protected route, redirect to login
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        setIsAllowed(false);
        setIsCheckingPermission(false);
        return;
      }
      
      // If any authenticated user is allowed, allow access
      if (allowAnyAuthenticated) {
        console.log("Any authenticated user allowed, granting access");
        setIsAllowed(true);
        setIsCheckingPermission(false);
        return;
      }
      
      // If specific module access is required, check it
      if (module) {
        const hasModuleAccess = canAccessModule(module);
        console.log(`Checking module access for ${module}:`, hasModuleAccess);
        setIsAllowed(hasModuleAccess);
        setIsCheckingPermission(false);
        return;
      }
      
      // If specific roles are required, check if the user has one of them
      if (allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.includes(role as UserRole);
        console.log("Role check:", { userRole: role, allowedRoles, hasRequiredRole });
        setIsAllowed(hasRequiredRole);
        setIsCheckingPermission(false);
        return;
      }
      
      // By default, allow access if we reach this point (user is authenticated)
      setIsAllowed(true);
      setIsCheckingPermission(false);
    };
    
    checkAccess();
  }, [isLoading, isAuthenticated, role, allowedRoles, allowAnyAuthenticated, module, canAccessModule]);

  // Add debug logging
  useEffect(() => {
    console.log("ProtectedRoute - Role:", role, 
      "Authenticated:", isAuthenticated, 
      "Allowed roles:", allowedRoles,
      "Any authenticated allowed:", allowAnyAuthenticated,
      "Module required:", module,
      "Is allowed:", isAllowed);
  }, [role, isAuthenticated, allowedRoles, allowAnyAuthenticated, module, isAllowed]);

  // Show loading state while checking auth or permissions
  if (isLoading || isCheckingPermission || isAllowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Sjekker tilgangsrettigheter...</p>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    toast({
      title: "Pålogging kreves",
      description: "Du må logge inn for å se denne siden",
    });
    
    // Pass the current location as a return URL
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?returnUrl=${returnPath}`} replace />;
  }

  // If user is authenticated but not allowed, redirect to unauthorized
  if (isAuthenticated && !isAllowed) {
    toast({
      title: "Ingen tilgang",
      description: "Du har ikke tilgang til denne siden",
      variant: "destructive"
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and allowed to access this route
  return <>{children}</>;
};
