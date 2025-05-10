
import { useAuthContext } from './useAuthContext';
import { UserRole } from '../types/types';

/**
 * Hook for checking user roles and permissions
 */
export const useRoleHelpers = () => {
  const { authState } = useAuthContext();
  const { profile, user } = authState;

  // Determine the role - user is either authenticated with a specific role, or anonymous
  const currentRole: UserRole = profile?.role || (user ? 'member' : 'guest');

  return {
    role: currentRole,
    isAuthenticated: !!user,
    isAnonymous: !user,
    isUser: currentRole === 'member',
    isCompany: currentRole === 'company',
    isAdmin: currentRole === 'admin' || currentRole === 'master_admin',
    isMasterAdmin: currentRole === 'master_admin',
    isProvider: currentRole === 'provider',
    isEditor: currentRole === 'editor',
  };
};
