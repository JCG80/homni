import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/roles/types';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const { isLoading, isAuthenticated, role, canAccessModule, hasRole } = useAuth();
  const location = useLocation();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [showLoadingUI, setShowLoadingUI] = useState(false);

  // Only show loading UI if it takes more than a short time
  useEffect(() => {
    if (isLoading || isCheckingPermission) {
      const timer = setTimeout(() => setShowLoadingUI(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingUI(false);
    }
  }, [isLoading, isCheckingPermission]);

  // Protection against infinite loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isCheckingPermission) {
        setIsCheckingPermission(false);
        // Default to allowing access after timeout for authenticated users
        if (isAuthenticated) {
          setIsAllowed(true);
        }
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isCheckingPermission, isAuthenticated]);

  // Check if user is allowed to access this route
  useEffect(() => {
    const checkAccess = async () => {
      setIsCheckingPermission(true);
      
      // Wait for auth to initialize
      if (isLoading) {
        return;
      }
      
      // PRIORITY: Check module access first (handles public modules for guest users)
      if (module) {
        const hasModuleAccess = canAccessModule(module);
        setIsAllowed(hasModuleAccess);
        setIsCheckingPermission(false);
        return;
      }
      
      // If not authenticated and no module specified, redirect to login
      if (!isAuthenticated) {
        setIsAllowed(false);
        setIsCheckingPermission(false);
        return;
      }
      
      // CRITICAL FIX: If user is authenticated but role is still undefined/null, wait a bit more
      if (isAuthenticated && (!role || role === null || role === undefined)) {
        // Don't set isAllowed yet, keep checking
        setTimeout(() => {
          // Re-trigger this effect after a short delay
          setIsCheckingPermission(true);
        }, 100);
        return;
      }
      
      // If any authenticated user is allowed, allow access
      if (allowAnyAuthenticated && isAuthenticated && role) {
        setIsAllowed(true);
        setIsCheckingPermission(false);
        return;
      }
      
      // If specific roles are required, check if the user has one of them
      if (allowedRoles.length > 0 && role) {
        const hasRequiredRole = allowedRoles.some(r => hasRole(r));
        setIsAllowed(hasRequiredRole);
        setIsCheckingPermission(false);
        return;
      }
      
      // By default, allow access if we reach this point and user is authenticated with a role
      if (isAuthenticated && role) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }
      setIsCheckingPermission(false);
    };
    
    checkAccess();
  }, [isLoading, isAuthenticated, role, allowedRoles, allowAnyAuthenticated, module, canAccessModule, hasRole, location.pathname]);

  // Show loading state while checking auth or permissions, but only if it takes more than a moment
  if ((isLoading || isCheckingPermission || isAllowed === null) && showLoadingUI) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Sjekker tilgangsrettigheter...</p>
        </div>
      </div>
    );
  }
  
  // If auth check is complete but user is not authenticated, redirect to login with return URL
  if (!isLoading && !isCheckingPermission && !isAuthenticated) {
    console.log("ProtectedRoute - Redirecting to login");
    toast({
      title: "Pålogging kreves",
      description: "Du må logge inn for å se denne siden",
    });
    
    // Pass the current location as a return URL
    const returnPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${redirectTo}?returnUrl=${returnPath}`} replace />;
  }

  // If auth check is complete but user is not allowed, redirect to unauthorized
  if (!isLoading && !isCheckingPermission && isAuthenticated && isAllowed === false) {
    console.log("ProtectedRoute - Access denied, redirecting to unauthorized");
    toast({
      title: "Ingen tilgang",
      description: "Du har ikke tilgang til denne siden",
      variant: "destructive"
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If we're still loading or checking permissions, render nothing (or minimal placeholder)
  if (isLoading || isCheckingPermission || isAllowed === null) {
    return <></>; // Minimal placeholder to avoid flicker
  }
  
  // User is authenticated and allowed to access this route
  console.log("ProtectedRoute - Access granted, rendering children");
  return <>{children}</>;
};
