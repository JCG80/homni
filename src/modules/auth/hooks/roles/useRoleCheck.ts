
import { useState, useEffect } from 'react';
import { UserRole } from '../../utils/roles';
import { useAuthState } from '../useAuthState';

/**
 * Hook that provides role checking functionality
 * 
 * @returns An object with methods to check user roles
 */
export const useRoleCheck = () => {
  const { user, profile, role: userRole } = useAuthState();

  // Determine the current role - use profile role first, then user role, default to anonymous
  const currentRole: UserRole = profile?.role || user?.role || (user ? 'member' : 'anonymous');
  
  // Add debug log to see what role is being determined
  console.log("useRoleCheck - Determined role:", currentRole, "Profile:", profile?.role, "User role:", user?.role, "Has user:", !!user);

  return {
    /**
     * The user's current role
     */
    role: currentRole,
    
    /**
     * Check if the user is authenticated
     */
    isAuthenticated: !!user,
    
    /**
     * Check if the user is not authenticated
     */
    isAnonymous: !user,
    
    /**
     * Check if the user has the member role
     */
    isMember: currentRole === 'member',
    
    /**
     * Check if the user has the company role
     */
    isCompany: currentRole === 'company',
    
    /**
     * Check if the user has an admin role (admin or master_admin)
     */
    isAdmin: currentRole === 'admin' || currentRole === 'master_admin',
    
    /**
     * Check if the user has the master_admin role
     */
    isMasterAdmin: currentRole === 'master_admin',
    
    /**
     * Check if the user has the content_editor role
     */
    isContentEditor: currentRole === 'content_editor',
    
    /**
     * Check if the user has at least one of the specified roles
     * 
     * @param roles - A single role or array of roles to check
     * @returns True if the user has at least one of the specified roles
     */
    hasRole: (roles: UserRole | UserRole[]): boolean => {
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      return rolesToCheck.includes(currentRole);
    },

    /**
     * Check if the user can access a specific module
     * 
     * @param moduleId - The ID of the module to check
     * @returns True if the user can access the module
     */
    canAccessModule: (moduleId: string): boolean => {
      // Master admin can access everything
      if (currentRole === 'master_admin') {
        return true;
      }
      
      try {
        // Import the canAccessModule function directly to avoid circular dependencies
        const { canAccessModule } = require('../../utils/roles/guards');
        return canAccessModule(currentRole, moduleId);
      } catch (error) {
        console.error('Error checking module access:', error);
        return false;
      }
    }
  };
};
