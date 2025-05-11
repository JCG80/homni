
import { useAuthContext } from './useAuthContext';
import { UserRole } from '../utils/roles';

/**
 * Hook for checking user roles and permissions
 */
export const useRoleHelpers = () => {
  const { authState } = useAuthContext();
  const { profile, user } = authState;

  // Determine the role - user is either authenticated with a specific role, or anonymous
  const currentRole: UserRole = profile?.role || (user ? 'user' : 'anonymous');

  return {
    role: currentRole,
    isAuthenticated: !!user,
    isAnonymous: !user,
    isUser: currentRole === 'user',
    isCompany: currentRole === 'company',
    isAdmin: currentRole === 'admin' || currentRole === 'master_admin',
    isMasterAdmin: currentRole === 'master_admin',
    // Remove deprecated roles
  };
};
