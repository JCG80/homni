
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '../types/types';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseRoleGuardOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const useRoleGuard = ({ 
  allowedRoles = [], // Make optional with empty array default 
  redirectTo = '/unauthorized' 
}: UseRoleGuardOptions) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    console.log('useRoleGuard - isAuthenticated:', isAuthenticated, 'role:', role, 'path:', location.pathname, 'allowedRoles:', allowedRoles);

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to /login');
      navigate('/login');
      setLoading(false);
      return;
    }

    // Special case for /leads/test route - allow all authenticated users to access
    if (location.pathname === '/leads/test') {
      console.log('Accessing /leads/test - bypassing role check for testing purposes');
      setIsAllowed(true);
      setLoading(false);
      return;
    }

    // If no specific roles are required, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      console.log('No specific roles required, granting access');
      setIsAllowed(true);
      setLoading(false);
      return;
    }

    console.log('Role check in useRoleGuard - Current role:', role, 'Allowed roles:', allowedRoles);

    if (!role || !allowedRoles.includes(role as UserRole)) {
      console.error('Access denied in useRoleGuard. User role:', role, 'Required roles:', allowedRoles);
      navigate(redirectTo);
      setLoading(false);
      return;
    }

    setIsAllowed(true);
    setLoading(false);
  }, [isAuthenticated, role, isLoading, allowedRoles, redirectTo, navigate, location.pathname]);

  return { isAllowed, loading, redirect: () => navigate(redirectTo) };
};
