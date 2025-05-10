
import { UserRole } from '../utils/roles';
import { Profile, AuthUser } from '../types/types';

interface AuthDerivedStateProps {
  user: AuthUser | null;
  profile: Profile | null;
}

/**
 * Hook that derives state from auth user and profile
 */
export const useAuthDerivedState = ({ user, profile }: AuthDerivedStateProps) => {
  // Determine the role - user is either authenticated with a specific role, or guest
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
