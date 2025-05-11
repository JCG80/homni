
import { AuthUser, Profile } from '../types/types';
import { UserRole } from '../utils/roles';

interface AuthStateInput {
  user: AuthUser | null;
  profile: Profile | null;
}

interface AuthDerivedState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  role: UserRole | undefined;
}

export const useAuthDerivedState = ({ user, profile }: AuthStateInput): AuthDerivedState => {
  // Calculate derived state
  const isAuthenticated = !!user;
  const role = profile?.role;
  const isAdmin = role === 'admin' || role === 'master_admin';
  const isMasterAdmin = role === 'master_admin';
  const isCompany = role === 'company';
  const isUser = role === 'member';

  return {
    isAuthenticated,
    isAdmin,
    isMasterAdmin,
    isCompany,
    isUser,
    role,
  };
};
