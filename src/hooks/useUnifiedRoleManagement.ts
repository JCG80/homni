/**
 * UNIFIED ROLE MANAGEMENT HOOK
 * Consolidates all role-related functionality into a single, consistent interface
 */

import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useRoleGrants } from './useRoleGrants';
import { UserRole } from '@/types/consolidated-types';

/**
 * Unified role management interface
 */
export interface UnifiedRoleManagement {
  // Current user's role information
  currentRole: UserRole | null;
  effectiveRoles: UserRole[];
  isMasterAdmin: boolean;
  isAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  isGuest: boolean;
  
  // Role checking utilities
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
  
  // Role management (for admins)
  grantRole: (userId: string, role: UserRole, context?: Record<string, any>) => void;
  revokeRole: (userId: string, role: UserRole, context?: Record<string, any>) => void;
  
  // Loading states
  isLoading: boolean;
  isGranting: boolean;
  isRevoking: boolean;
  
  // Error handling
  error: any;
}

/**
 * Main unified role management hook
 */
export function useUnifiedRoleManagement(targetUserId?: string): UnifiedRoleManagement {
  const { user, profile, hasRole: authHasRole } = useAuth();
  const {
    roleGrants,
    effectiveRoles,
    isMasterAdmin,
    isLoading,
    error,
    grantRole,
    revokeRole,
    hasRole: grantsHasRole,
    isGranting,
    isRevoking
  } = useRoleGrants(targetUserId);

  /**
   * Current user's primary role
   */
  const currentRole = useMemo((): UserRole | null => {
    if (profile?.role) {
      return profile.role as UserRole;
    }
    if (effectiveRoles.length > 0) {
      // Return highest privilege role
      const roleHierarchy: UserRole[] = ['master_admin', 'admin', 'content_editor', 'company', 'user', 'guest'];
      for (const role of roleHierarchy) {
        if (effectiveRoles.includes(role)) {
          return role;
        }
      }
    }
    return null;
  }, [profile?.role, effectiveRoles]);

  /**
   * Role-based boolean flags
   */
  const roleFlags = useMemo(() => ({
    isMasterAdmin: effectiveRoles.includes('master_admin') || isMasterAdmin,
    isAdmin: effectiveRoles.includes('admin') || effectiveRoles.includes('master_admin'),
    isCompany: effectiveRoles.includes('company'),
    isUser: effectiveRoles.includes('user'),
    isGuest: effectiveRoles.includes('guest') || effectiveRoles.length === 0
  }), [effectiveRoles, isMasterAdmin]);

  /**
   * Enhanced role checking utilities
   */
  const roleChecking = useMemo(() => ({
    hasRole: (role: UserRole | UserRole[]): boolean => {
      const roles = Array.isArray(role) ? role : [role];
      return roles.some(r => effectiveRoles.includes(r));
    },
    
    hasAnyRole: (roles: UserRole[]): boolean => {
      return roles.some(r => effectiveRoles.includes(r));
    },
    
    hasAllRoles: (roles: UserRole[]): boolean => {
      return roles.every(r => effectiveRoles.includes(r));
    },
    
    canAccess: (requiredRole: UserRole | UserRole[]): boolean => {
      if (!requiredRole) return true;
      
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      // Master admin can access everything
      if (roleFlags.isMasterAdmin) return true;
      
      // Check if user has any of the required roles
      return requiredRoles.some(role => effectiveRoles.includes(role));
    }
  }), [effectiveRoles, roleFlags.isMasterAdmin]);

  /**
   * Role management functions (for admin users)
   */
  const roleManagement = useMemo(() => ({
    grantRole: (userId: string, role: UserRole, context?: Record<string, any>) => {
      if (!roleFlags.isAdmin && !roleFlags.isMasterAdmin) {
        throw new Error('Insufficient permissions to grant roles');
      }
      grantRole(role, context);
    },
    
    revokeRole: (userId: string, role: UserRole, context?: Record<string, any>) => {
      if (!roleFlags.isAdmin && !roleFlags.isMasterAdmin) {
        throw new Error('Insufficient permissions to revoke roles');
      }
      revokeRole(role, context);
    }
  }), [roleFlags.isAdmin, roleFlags.isMasterAdmin, grantRole, revokeRole]);

  return {
    // Current user information
    currentRole,
    effectiveRoles,
    ...roleFlags,
    
    // Role checking utilities
    ...roleChecking,
    
    // Role management
    ...roleManagement,
    
    // Loading and error states
    isLoading,
    isGranting,
    isRevoking,
    error
  };
}

/**
 * Simplified hook for basic role checking
 */
export function useRoleCheck(requiredRole?: UserRole | UserRole[]) {
  const { canAccess, isLoading } = useUnifiedRoleManagement();
  
  return {
    hasAccess: requiredRole ? canAccess(requiredRole) : true,
    isLoading
  };
}

/**
 * Hook for admin-level role management
 */
export function useAdminRoleManagement() {
  const roleManagement = useUnifiedRoleManagement();
  
  if (!roleManagement.isAdmin && !roleManagement.isMasterAdmin) {
    throw new Error('This hook can only be used by admin users');
  }
  
  return roleManagement;
}