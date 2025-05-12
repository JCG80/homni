
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
  const [detectedRole, setDetectedRole] = useState<UserRole | undefined>(undefined);

  // Determine the current role - use profile role first, then user role, default to anonymous
  useEffect(() => {
    let role: UserRole = profile?.role || user?.role || (user ? 'member' : 'anonymous');
    
    // For development testing - check emails for specific test users
    if (!role && user?.email && import.meta.env.MODE === 'development') {
      const email = user.email.toLowerCase();
      if (email === 'admin@test.local') role = 'admin';
      if (email === 'company@test.local') role = 'company';
      if (email === 'master-admin@test.local') role = 'master_admin';
      if (email === 'content@test.local') role = 'content_editor';
    }
    
    // If still no role, default to member for authenticated users
    if (!role && !!user) {
      role = 'member';
    }
    
    console.log("useRoleCheck - Determined role:", role, "Profile:", profile?.role, "User role:", user?.role, "Has user:", !!user);
    setDetectedRole(role);
  }, [user, profile]);

  return {
    /**
     * The user's current role
     */
    role: detectedRole,
    
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
    isMember: detectedRole === 'member',
    
    /**
     * Check if the user has the company role
     */
    isCompany: detectedRole === 'company',
    
    /**
     * Check if the user has an admin role (admin or master_admin)
     */
    isAdmin: detectedRole === 'admin' || detectedRole === 'master_admin',
    
    /**
     * Check if the user has the master_admin role
     */
    isMasterAdmin: detectedRole === 'master_admin',
    
    /**
     * Check if the user has the content_editor role
     */
    isContentEditor: detectedRole === 'content_editor',
    
    /**
     * Check if the user has at least one of the specified roles
     * 
     * @param roles - A single role or array of roles to check
     * @returns True if the user has at least one of the specified roles
     */
    hasRole: (roles: UserRole | UserRole[]): boolean => {
      if (!detectedRole) return false;
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      return rolesToCheck.includes(detectedRole);
    },

    /**
     * Check if the user can access a specific module
     * 
     * @param moduleId - The ID of the module to check
     * @returns True if the user can access the module
     */
    canAccessModule: (moduleId: string): boolean => {
      // Master admin can access everything
      if (detectedRole === 'master_admin') {
        return true;
      }
      
      try {
        // Import the canAccessModule function directly to avoid circular dependencies
        const { canAccessModule } = require('../../utils/roles/guards');
        return canAccessModule(detectedRole, moduleId);
      } catch (error) {
        console.error('Error checking module access:', error);
        return false;
      }
    }
  };
};
