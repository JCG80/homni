
import { useCallback } from 'react';
import { AuthUser, Profile } from '../types/types';
import { UserRole } from '../utils/roles/types';

interface AuthBaseState {
  user: AuthUser | null;
  profile: Profile | null;
}

/**
 * Hook that provides derived state from auth data (user and profile)
 * This separates the derived state logic from the main auth state management
 */
export const useAuthDerivedState = ({ user, profile }: AuthBaseState) => {
  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Determine role - use profile role first, then user role, default to undefined
  const role: UserRole | undefined = profile?.role ?? user?.role;

  // Helper function to check if user has a specific role
  const hasRole = useCallback((roleToCheck: UserRole) => {
    return role === roleToCheck;
  }, [role]);

  // Helper functions to check common roles
  const isAdmin = useCallback(() => {
    return hasRole('admin') || hasRole('master_admin');
  }, [hasRole]);

  const isMasterAdmin = useCallback(() => {
    return hasRole('master_admin');
  }, [hasRole]);

  const isCompany = useCallback(() => {
    return hasRole('company');
  }, [hasRole]);

  const isUser = useCallback(() => {
    return hasRole('user');
  }, [hasRole]);

  return {
    isAuthenticated,
    isAdmin: isAdmin(),
    isMasterAdmin: isMasterAdmin(),
    isCompany: isCompany(),
    isUser: isUser(),
    role,
  };
};
