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
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();

  /**
   * Redirects the user to their appropriate dashboard based on role
   */
  const redirectToDashboard = () => {
    if (!isAuthenticated) {
      return;
    }

    console.log("Redirecting with role:", role);

    // If a specific redirect path is provided, use it
    if (redirectPath) {
      navigate(redirectPath);
      return;
    }
    
    // Directly navigate to the role-specific dashboard if role is available
    if (role) {
      navigate(`/dashboard/${role}`);
      return;
    }
    
    // Otherwise use the main dashboard route which will handle the redirection
    navigate('/dashboard');
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
  }, [isAuthenticated, isLoading, autoRedirect, role]);

  return {
    redirectToDashboard,
    redirectToLogin,
    isLoading
  };
};
