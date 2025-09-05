import { useCallback } from 'react';
import { AuthUser, Profile, ModuleAccess } from '../types/types';
import { UserRole } from '../utils/roles/types';

interface AuthBaseState {
  user: AuthUser | null;
  profile: Profile | null;
  module_access?: ModuleAccess[];
}

/**
 * Hook that provides derived state from auth data (user and profile)
 * This separates the derived state logic from the main auth state management
 */
export const useAuthDerivedState = ({ user, profile, module_access = [] }: AuthBaseState) => {
  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Determine role - first check profile role, then user role, then use testing emails if in dev mode
  let role: UserRole | undefined = profile?.role || user?.role;
  
  console.log("useAuthDerivedState - DETAILED ROLE DEBUG:", {
    profileRole: profile?.role,
    userRole: user?.role,
    profileData: profile,
    userData: user,
    isAuthenticated
  });
  
  // For development testing - check emails for specific test users
  if (!role && user?.email && import.meta.env.MODE === 'development') {
    const email = user.email.toLowerCase();
    console.log("useAuthDerivedState - Checking email fallback for:", email);
    if (email === 'admin@homni.no') role = 'admin';
    if (email === 'company@homni.no') role = 'company';
    if (email === 'master@homni.no') role = 'master_admin';
    if (email === 'content@homni.no') role = 'content_editor';
    console.log("useAuthDerivedState - Email fallback result:", role);
  }
  
  // If still no role, default to user for authenticated users
  if (!role && isAuthenticated) {
    role = 'user';
    console.log("useAuthDerivedState - Using default 'user' role");
  }
  
  console.log("useAuthDerivedState - FINAL DETERMINED ROLE:", role);

  // Get account type from user metadata or profile
  const account_type = (profile as any)?.metadata?.account_type || (profile as any)?.account_type || 'user';
  
  // Get internal admin flag from user metadata, profile, or module_access
  const internal_admin = 
    (profile as any)?.metadata?.internal_admin || 
    (profile as any)?.internal_admin || 
    module_access.some(access => access.internal_admin) || 
    false;

  // Helper function to check if user has a specific role
  const hasRole = useCallback((roleToCheck: UserRole) => {
    return role === roleToCheck;
  }, [role]);

  // Helper function to check if user can access a specific module
  const canAccessModule = useCallback((moduleId: string) => {
    // Master admins can access everything
    if (role === 'master_admin' || internal_admin) return true;
    
    // Check if user has access to this specific module
    return module_access.some(access => access.system_module_id === moduleId);
  }, [role, internal_admin, module_access]);

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
    return hasRole('user') || account_type === 'user';
  }, [hasRole, account_type]);

  return {
    isAuthenticated,
    isAdmin: isAdmin(),
    isMasterAdmin: isMasterAdmin(),
    isCompany: isCompany(),
    isMember: isMember(),
    role,
    account_type,
    internal_admin,
    canAccessModule,
  };
};
