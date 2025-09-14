import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AppRole, ROLE_LEVELS, getRoleLevel } from '@/constants/roles';

interface UserRoleData {
  currentRole: AppRole | null;
  roleLevel: number;
  effectiveRoles: AppRole[];
}

/**
 * Hook to check and manage user roles with role level access
 */
export function useRoles() {
  const { user, profile } = useAuth();

  // Fetch user's effective roles from the database
  const { data: roleData, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<UserRoleData> => {
      if (!user?.id) {
        return {
          currentRole: 'guest',
          roleLevel: 0,
          effectiveRoles: ['guest']
        };
      }

      // Get user's active roles from user_roles table
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()');

      if (error) {
        console.error('Error fetching user roles:', error);
        // Fallback to profile role if available
        const profileRole = profile?.role as AppRole || 'user';
        return {
          currentRole: profileRole,
          roleLevel: getRoleLevel(profileRole),
          effectiveRoles: [profileRole]
        };
      }

      // Extract roles from the result
      const effectiveRoles = userRoles?.map(r => r.role as AppRole) || [];
      
      // Add profile role if it exists and is not already included
      if (profile?.role && !effectiveRoles.includes(profile.role as AppRole)) {
        effectiveRoles.push(profile.role as AppRole);
      }

      // If no roles found, default to 'user'
      if (effectiveRoles.length === 0) {
        effectiveRoles.push('user');
      }

      // Current role is the highest level role
      const currentRole = effectiveRoles.reduce((highest, current) => {
        return getRoleLevel(current) > getRoleLevel(highest) ? current : highest;
      }, effectiveRoles[0]);

      return {
        currentRole,
        roleLevel: getRoleLevel(currentRole),
        effectiveRoles
      };
    },
    enabled: true, // Always enabled, will handle guest case internally
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  return useMemo(() => {
    const currentRole = roleData?.currentRole || 'guest';
    const roleLevel = roleData?.roleLevel || 0;
    const effectiveRoles = roleData?.effectiveRoles || ['guest'];

    return {
      // Current state
      currentRole,
      roleLevel,
      effectiveRoles,
      isLoading,

      // Role checking functions
      hasRole: (role: AppRole): boolean => {
        return effectiveRoles.includes(role);
      },

      hasAnyRole: (roles: AppRole[]): boolean => {
        return roles.some(role => effectiveRoles.includes(role));
      },

      hasAllRoles: (roles: AppRole[]): boolean => {
        return roles.every(role => effectiveRoles.includes(role));
      },

      hasRoleLevel: (minLevel: number): boolean => {
        return roleLevel >= minLevel;
      },

      // Convenience role checks
      isGuest: currentRole === 'guest',
      isUser: currentRole === 'user' || roleLevel >= ROLE_LEVELS.user,
      isCompany: currentRole === 'company' || roleLevel >= ROLE_LEVELS.company,
      isContentEditor: currentRole === 'content_editor' || roleLevel >= ROLE_LEVELS.content_editor,
      isAdmin: roleLevel >= ROLE_LEVELS.admin,
      isMasterAdmin: roleLevel >= ROLE_LEVELS.master_admin,

      // Access control
      canAccess: (requiredLevel: number): boolean => {
        return roleLevel >= requiredLevel;
      },

      canAccessRole: (requiredRole: AppRole): boolean => {
        return roleLevel >= getRoleLevel(requiredRole);
      }
    };
  }, [roleData, isLoading]);
}