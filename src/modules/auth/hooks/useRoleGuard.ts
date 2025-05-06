
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { UserRole } from '../types/types';

interface RoleGuardOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const useRoleGuard = ({ 
  allowedRoles, 
  redirectTo = '/login' 
}: RoleGuardOptions) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  
  if (isLoading) {
    return { isAllowed: false, loading: true };
  }
  
  if (!isAuthenticated) {
    return { 
      isAllowed: false, 
      loading: false,
      redirect: <Navigate to={redirectTo} replace /> 
    };
  }
  
  const isAllowed = role ? allowedRoles.includes(role) : false;
  
  return {
    isAllowed,
    loading: false,
    redirect: !isAllowed ? <Navigate to="/unauthorized" replace /> : undefined
  };
};
