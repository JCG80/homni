
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook that redirects users to the appropriate dashboard based on their role
 * @param redirectPathOverride Optional override for the redirect path
 */
export const useRoleRedirect = (redirectPathOverride?: string) => {
  const { isAuthenticated, isLoading, account_type, isAdmin, isMasterAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) {
      return;
    }

    // If authenticated, redirect to the appropriate dashboard
    if (isAuthenticated) {
      if (redirectPathOverride) {
        navigate(redirectPathOverride);
        return;
      }
      
      // Determine redirect based on role
      if (isMasterAdmin) {
        navigate('/master-admin');
      } else if (isAdmin) {
        navigate('/admin');
      } else if (account_type === 'company') {
        navigate('/dashboard/company');
      } else {
        // Default to member dashboard
        navigate('/dashboard/member');
      }
    }
  }, [isAuthenticated, isLoading, account_type, isAdmin, isMasterAdmin, navigate, redirectPathOverride]);

  return { isLoading };
};
