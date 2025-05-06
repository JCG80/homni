
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '../types/types';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseRoleGuardOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  allowAnyAuthenticated?: boolean;
}

export const useRoleGuard = ({ 
  allowedRoles = [],
  redirectTo = '/unauthorized',
  allowAnyAuthenticated = false
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

    console.log('useRoleGuard - isAuthenticated:', isAuthenticated, 'role:', role, 
      'path:', location.pathname, 'allowedRoles:', allowedRoles, 
      'allowAnyAuthenticated:', allowAnyAuthenticated);

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to /login');
      navigate('/login');
      setLoading(false);
      return;
    }

    // If allowAnyAuthenticated is true, grant access to any authenticated user
    if (allowAnyAuthenticated) {
      console.log('allowAnyAuthenticated is true, granting access to authenticated user');
      setIsAllowed(true);
      setLoading(false);
      return;
    }

    // If no specific roles are required, allow access
    if (allowedRoles.length === 0) {
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
  }, [isAuthenticated, role, isLoading, allowedRoles, redirectTo, navigate, location.pathname, allowAnyAuthenticated]);

  return { isAllowed, loading, redirect: () => navigate(redirectTo) };
};
