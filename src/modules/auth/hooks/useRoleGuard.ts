
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '../types/types';
import { useNavigate } from 'react-router-dom';

interface UseRoleGuardOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const useRoleGuard = ({ 
  allowedRoles, 
  redirectTo = '/unauthorized' 
}: UseRoleGuardOptions) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      setLoading(false);
      return;
    }

    if (!role || !allowedRoles.includes(role)) {
      navigate(redirectTo);
      setLoading(false);
      return;
    }

    setIsAllowed(true);
    setLoading(false);
  }, [isAuthenticated, role, isLoading, allowedRoles, redirectTo, navigate]);

  return { isAllowed, loading, redirect: () => navigate(redirectTo) };
};
