
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

  // Get account type from user metadata or profile
  const account_type = (profile as any)?.metadata?.account_type || (profile as any)?.account_type || 'member';
  
  // Get module access from user metadata or profile
  const module_access = (profile as any)?.metadata?.module_access || (profile as any)?.module_access || [];
  
  // Get internal admin flag from user metadata or profile
  const internal_admin = (profile as any)?.metadata?.internal_admin || (profile as any)?.internal_admin || false;

  // Helper function to check if user has a specific role
  const hasRole = useCallback((roleToCheck: UserRole) => {
    return role === roleToCheck;
  }, [role]);

  // Helper function to check if user can access a specific module
  const canAccessModule = useCallback((module: string) => {
    // Master admins can access everything
    if (role === 'master_admin' || internal_admin) return true;
    
    // Check if user has the module in their module_access list
    return Array.isArray(module_access) && module_access.includes(module);
  }, [role, module_access, internal_admin]);

  // Helper functions to check common roles
  const isAdmin = useCallback(() => {
    return hasRole('admin') || hasRole('master_admin') || internal_admin;
  }, [hasRole, internal_admin]);

  const isMasterAdmin = useCallback(() => {
    return hasRole('master_admin');
  }, [hasRole]);

  const isCompany = useCallback(() => {
    return hasRole('company') || account_type === 'company';
  }, [hasRole, account_type]);

  const isMember = useCallback(() => {
    return hasRole('member') || account_type === 'member';
  }, [hasRole, account_type]);

  return {
    isAuthenticated,
    isAdmin: isAdmin(),
    isMasterAdmin: isMasterAdmin(),
    isCompany: isCompany(),
    isMember: isMember(),
    role,
    account_type,
    module_access,
    internal_admin,
    canAccessModule,
  };
};
