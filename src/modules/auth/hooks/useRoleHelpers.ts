
import { useAuthContext } from './useAuthContext';
import { UserRole } from '../utils/roles';

/**
 * Hook for checking user roles and permissions
 */
export const useRoleHelpers = () => {
  const { authState } = useAuthContext();
  const { profile, user } = authState;

  // Determine the role - user is either authenticated with a specific role, or anonymous
  const currentRole: UserRole = profile?.role || (user ? 'member' : 'anonymous');

  return {
    role: currentRole,
    isAuthenticated: !!user,
    isAnonymous: !user,
    isMember: currentRole === 'member',
    isCompany: currentRole === 'company',
    isAdmin: currentRole === 'admin' || currentRole === 'master_admin',
    isMasterAdmin: currentRole === 'master_admin',
    
    // Check if the user has at least one of the specified roles
    hasRole: (roles: UserRole | UserRole[]): boolean => {
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      return rolesToCheck.includes(currentRole);
    }
  };
};
