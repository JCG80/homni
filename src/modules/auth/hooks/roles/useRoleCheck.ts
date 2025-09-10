
import { useMemo } from 'react';
import { UserRole, isUserRole } from '@/modules/auth/normalizeRole';
import { UseRoleCheckProps } from '@/types/hooks';

/**
 * Hook that provides role checking utilities
 */
export const useRoleCheck = (props?: UseRoleCheckProps) => {
  const roleFromProps = props?.role;
  
  return useMemo(() => {
    // Get role from props or null
    const role = roleFromProps || null;
    
    // Determine if role is guest (unauthenticated)
    const isGuest = !role || role === 'guest';
    
    // Check if user is admin (admin or master_admin)
    const isAdmin = role === 'admin' || role === 'master_admin';
    
    // Check if user is master admin
    const isMasterAdmin = role === 'master_admin';
    
    // Check if user is company
    const isCompany = role === 'company';
    
    // Check if user is regular user
    const isUser = role === 'user';
    
    // Check if user is content editor
    const isContentEditor = role === 'content_editor';
    
    // Helper function to check if user has a specific role
    const hasRole = (roleToCheck: UserRole | UserRole[]): boolean => {
      if (!role) return false;
      
      // If array of roles, check if user has any of them
      if (Array.isArray(roleToCheck)) {
        return roleToCheck.some(r => r === role);
      }
      
      return roleToCheck === role;
    };
    
    return {
      role,
      isGuest,
      isAdmin,
      isMasterAdmin,
      isCompany,
      isUser,
      isContentEditor,
      hasRole,
    };
  }, [roleFromProps]);
};
