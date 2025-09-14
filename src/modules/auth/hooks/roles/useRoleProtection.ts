
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '../../utils/roles/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface UseRoleProtectionOptions {
  /**
   * Roles that are allowed to access the protected resource
   */
  allowedRoles?: UserRole[];
  
  /**
   * Path to redirect to when access is denied
   * @default '/unauthorized'
   */
  redirectTo?: string;
  
  /**
   * Whether to allow any authenticated user regardless of role
   * @default false
   */
  allowAnyAuthenticated?: boolean;
  
  /**
   * Specific module ID to check for access
   */
  module?: string;
}

/**
 * Hook for protecting routes and components based on user roles
 * 
 * @param options - Configuration options for role protection
 * @returns Object with protection state and utilities
 */
export const useRoleProtection = ({ 
  allowedRoles = [],
  redirectTo = '/unauthorized',
  allowAnyAuthenticated = false,
  module
}: UseRoleProtectionOptions = {}) => {
  const { isAuthenticated, role, isLoading, canAccessModule } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  /**
   * Redirect user to the specified path
   */
  const redirect = useCallback((path: string = redirectTo) => {
    navigate(path, { state: { from: location } });
  }, [navigate, location, redirectTo]);

  /**
   * Check if the user can access the protected resource
   */
  const checkAccess = useCallback(() => {
    if (isLoading) {
      return false;
    }

    // Log the access check for debugging
    logger.info('Role protection check', { isAuthenticated, role, path: location.pathname, allowedRoles, allowAnyAuthenticated, module });

    // If not authenticated, access is denied
    if (!isAuthenticated) {
      logger.info('Access denied: Not authenticated');
      redirect('/login');
      return false;
    }

    // If module is specified, check module access
    if (module && !canAccessModule(module)) {
      logger.info('Access denied: No access to module', { module });
      return false;
    }

    // If allowAnyAuthenticated is true, allow access to any authenticated user
    if (allowAnyAuthenticated) {
      logger.info('Access granted: Any authenticated user allowed');
      return true;
    }

    // If no specific roles are required, allow access
    if (!allowedRoles.length) {
      logger.info('Access granted: No specific roles required');
      return true;
    }

    // Special case: master_admin has access to everything
    if (role === 'master_admin') {
      logger.info('Access granted: User is master_admin');
      return true;
    }

    // Check if user has one of the allowed roles
    const hasAllowedRole = role ? allowedRoles.includes(role as UserRole) : false;
    
    if (!hasAllowedRole) {
      logger.info('Access denied: Role not allowed', { role, allowedRoles });
      return false;
    }

    logger.info('Access granted: User has allowed role', { role });
    return true;
  }, [isAuthenticated, role, isLoading, allowedRoles, allowAnyAuthenticated, module, location.pathname, canAccessModule, redirect]);

  // Check access whenever relevant dependencies change
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const allowed = checkAccess();
    setIsAllowed(allowed);
    
    // If not allowed and not just loading, redirect
    if (!allowed && !isLoading) {
      // Redirect to login if not authenticated, otherwise to unauthorized
      const redirectPath = !isAuthenticated ? '/login' : redirectTo;
      redirect(redirectPath);
    }
    
    setLoading(false);
  }, [isAuthenticated, role, isLoading, allowedRoles, redirectTo, allowAnyAuthenticated, module, checkAccess, redirect]);

  return { 
    isAllowed, 
    loading, 
    redirect,
    checkAccess
  };
};
