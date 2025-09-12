import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../utils/roles/types';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

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
      
      // Debug logging for authorization issues
      logger.debug('ProtectedRoute authorization check', {
        component: 'ProtectedRoute',
        isAuthenticated,
        role,
        allowedRoles,
        allowAnyAuthenticated,
        module,
        pathname: location.pathname
      });
      
      // PRIORITY: Check module access first (handles public modules for guest users)
      if (module) {
        const hasModuleAccess = canAccessModule(module);
        logger.debug('ProtectedRoute module access check', { 
          component: 'ProtectedRoute',
          module, 
          hasModuleAccess 
        });
        setIsAllowed(hasModuleAccess);
        setIsCheckingPermission(false);
        return;
      }
      
      // If not authenticated and no module specified, redirect to login
      if (!isAuthenticated) {
        logger.info('ProtectedRoute denying access - not authenticated', {
          component: 'ProtectedRoute',
          pathname: location.pathname
        });
        setIsAllowed(false);
        setIsCheckingPermission(false);
        return;
      }
      
      // CRITICAL FIX: If user is authenticated but role is still undefined/null, wait a bit more
      if (isAuthenticated && (!role || role === null || role === undefined)) {
        logger.debug('ProtectedRoute waiting for role to be ready', {
          component: 'ProtectedRoute',
          isAuthenticated,
          role
        });
        // Don't set isAllowed yet, keep checking
        setTimeout(() => {
          // Re-trigger this effect after a short delay
          setIsCheckingPermission(true);
        }, 100);
        return;
      }
      
      // If any authenticated user is allowed, allow access
      if (allowAnyAuthenticated && isAuthenticated && role) {
        logger.debug('ProtectedRoute allowing any authenticated user', {
          component: 'ProtectedRoute',
          role
        });
        setIsAllowed(true);
        setIsCheckingPermission(false);
        return;
      }
      
      // If specific roles are required, check if the user has one of them
      if (allowedRoles.length > 0 && role) {
        const hasRequiredRole = allowedRoles.some(r => hasRole(r));
        logger.debug('ProtectedRoute role check', { 
          component: 'ProtectedRoute',
          role, 
          allowedRoles, 
          hasRequiredRole,
          roleChecks: allowedRoles.map(r => ({ role: r, hasRole: hasRole(r) }))
        });
        setIsAllowed(hasRequiredRole);
        setIsCheckingPermission(false);
        return;
      }
      
      // By default, allow access if we reach this point and user is authenticated with a role
      if (isAuthenticated && role) {
        logger.debug('ProtectedRoute default allow for authenticated user', {
          component: 'ProtectedRoute',
          role
        });
        setIsAllowed(true);
      } else {
        logger.debug('ProtectedRoute default deny', {
          component: 'ProtectedRoute',
          isAuthenticated,
          role
        });
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
    logger.info('ProtectedRoute redirecting to login', {
      component: 'ProtectedRoute',
      pathname: location.pathname
    });
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
    logger.warn('ProtectedRoute access denied', {
      component: 'ProtectedRoute',
      pathname: location.pathname,
      role,
      allowedRoles,
      module
    });
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
  logger.debug('ProtectedRoute access granted', {
    component: 'ProtectedRoute',
    pathname: location.pathname,
    role
  });
  return <>{children}</>;
};
