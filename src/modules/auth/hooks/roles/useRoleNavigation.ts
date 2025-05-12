
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

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
  const { isAuthenticated, isLoading, role, isAdmin, isMasterAdmin } = useAuth();
  const navigate = useNavigate();

  /**
   * Redirects the user to their appropriate dashboard based on role
   */
  const redirectToDashboard = () => {
    if (!isAuthenticated) {
      return;
    }

    // If a specific redirect path is provided, use it
    if (redirectPath) {
      navigate(redirectPath);
      return;
    }
    
    // Determine redirect based on role
    if (role === 'master_admin') {
      navigate('/dashboard/master_admin');
    } else if (role === 'admin') {
      navigate('/dashboard/admin');
    } else if (role === 'company') {
      navigate('/dashboard/company');
    } else if (role === 'content_editor') {
      navigate('/dashboard/content_editor');
    } else {
      // Default to member dashboard
      navigate('/dashboard/member');
    }
  };

  /**
   * Redirects to login page with return URL
   */
  const redirectToLogin = (returnPath?: string) => {
    const returnUrl = returnPath || window.location.pathname;
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  // Auto-redirect if enabled
  useEffect(() => {
    if (!autoRedirect || isLoading) {
      return;
    }

    if (isAuthenticated) {
      redirectToDashboard();
    }
  }, [isAuthenticated, isLoading, autoRedirect]);

  return {
    redirectToDashboard,
    redirectToLogin,
    isLoading
  };
};
