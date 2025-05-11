
import { useCallback } from 'react';
import { AuthUser, Profile } from '../types/types';
import { UserRole } from '../utils/roles';

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

  // Helper function to check if user has a specific role
  const hasRole = useCallback((role: UserRole) => {
    return profile?.role === role;
  }, [profile]);

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
    return hasRole('member');
  }, [hasRole]);

  return {
    isAuthenticated,
    isAdmin: isAdmin(),
    isMasterAdmin: isMasterAdmin(),
    isCompany: isCompany(),
    isUser: isUser(),
    role: profile?.role,
  };
};
