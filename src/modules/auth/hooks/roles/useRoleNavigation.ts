import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/types/auth';

interface UseRoleNavigationOptions {
  /**
   * Custom redirect path to override default role-based paths
   */
  redirectPath?: string;
  
  /**
   * Whether to perform the redirect automatically on mount
   * @default true
   */
  autoRedirect?: boolean;
}

/**
 * Hook for role-based navigation that redirects users based on their role
 * 
 * @param options - Options for configuring the navigation behavior
 * @returns Navigation utilities and state
 */
export const useRoleNavigation = (options: UseRoleNavigationOptions = {}) => {
  const { redirectPath, autoRedirect = true } = options;
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();

  /**
   * Redirects the user to their appropriate dashboard based on role
   */
  const redirectToDashboard = () => {
    if (!isAuthenticated) {
      console.log("[useRoleNavigation] Not redirecting - user not authenticated");
      return;
    }

    if (!role) {
      console.warn("[useRoleNavigation] Cannot redirect - no role available", { isAuthenticated, role });
      return;
    }

    console.log("[useRoleNavigation] Redirecting with role:", role);

    try {
      // If a specific redirect path is provided, use it
      if (redirectPath) {
        console.log(`[useRoleNavigation] Using specified redirect path: ${redirectPath}`);
        navigate(redirectPath, { replace: true });
        return;
      }
      
      // Directly navigate to the role-specific dashboard if role is available
      const dashboardPath = routeForRole(role as UserRole);
      console.log(`[useRoleNavigation] Navigating to role dashboard: ${dashboardPath}`);
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      console.error("[useRoleNavigation] Navigation error:", error);
      // Fallback to generic dashboard
      navigate('/dashboard', { replace: true });
    }
  };

  /**
   * Redirects to login page with return URL
   */
  const redirectToLogin = (returnPath?: string) => {
    const returnUrl = returnPath || window.location.pathname;
    console.log(`[useRoleNavigation] Redirecting to login with return URL: ${returnUrl}`);
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  /**
   * Navigate to a specific role dashboard
   */
  const goToDashboard = (specificRole?: string) => {
    const targetRole = specificRole || role;
    if (!targetRole) {
      console.log("[useRoleNavigation] No role specified, using main dashboard");
      navigate('/dashboard');
      return;
    }
    
    console.log(`[useRoleNavigation] goToDashboard called for role: ${targetRole}`);
    navigate(routeForRole(targetRole as UserRole));
  };

  // Auto-redirect with timeout protection
  useEffect(() => {
    if (!autoRedirect || isLoading) {
      return;
    }

    if (isAuthenticated && role) {
      console.log(`[useRoleNavigation] Auto-redirect triggered with role: ${role}`);
      
      // Add slight delay to prevent redirect loops
      const redirectTimeout = setTimeout(() => {
        redirectToDashboard();
      }, 100);

      return () => clearTimeout(redirectTimeout);
    }
  }, [isAuthenticated, isLoading, autoRedirect, role]);

  return {
    redirectToDashboard,
    redirectToLogin,
    goToDashboard,
    isLoading
  };
};
