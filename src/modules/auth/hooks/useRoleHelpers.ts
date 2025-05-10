
import { useAuthContext } from './useAuthContext';
import { UserRole } from '../types/types';

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
    isAdmin: currentRole === 'admin' || currentRole === 'master-admin',
    isMasterAdmin: currentRole === 'master-admin',
    isProvider: currentRole === 'provider',
    isEditor: currentRole === 'editor',
  };
};
