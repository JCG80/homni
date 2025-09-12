import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoleGrantsService, RoleGrant } from '@/services/roleGrantsService';
import { UserRole } from '@/modules/auth/normalizeRole';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

/**
 * Hook for managing user role grants
 */
export function useRoleGrants(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = targetUserId || user?.id;

  // Query for user's role grants
  const {
    data: roleGrants = [],
    isLoading: isLoadingGrants,
    error: grantsError
  } = useQuery({
    queryKey: ['role-grants', userId],
    queryFn: () => userId ? RoleGrantsService.getUserRoleGrants(userId) : [],
    enabled: !!userId,
  });

  // Query for user's effective roles
  const {
    data: effectiveRoles = [],
    isLoading: isLoadingRoles,
    error: rolesError
  } = useQuery({
    queryKey: ['effective-roles', userId],
    queryFn: () => userId ? RoleGrantsService.getUserEffectiveRoles(userId) : [],
    enabled: !!userId,
  });

  // Query for master admin status
  const {
    data: isMasterAdmin = false,
    isLoading: isLoadingMasterAdmin
  } = useQuery({
    queryKey: ['is-master-admin', userId],
    queryFn: () => userId ? RoleGrantsService.isMasterAdmin(userId) : false,
    enabled: !!userId,
  });

  // Grant role mutation
  const grantRoleMutation = useMutation({
    mutationFn: ({ role, context }: { role: UserRole; context?: Record<string, any> }) => 
      userId ? RoleGrantsService.grantRole(userId, role, context) : Promise.reject('No user ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-grants', userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-roles', userId] });
      queryClient.invalidateQueries({ queryKey: ['is-master-admin', userId] });
      toast.success('Rolle tildelt');
    },
    onError: (error) => {
      logger.error('Error granting role:', {
        module: 'useRoleGrants',
        userId,
        action: 'grantRole'
      }, error as Error);
      toast.error('Feil ved tildeling av rolle');
    },
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: ({ role, context }: { role: UserRole; context?: Record<string, any> }) => 
      userId ? RoleGrantsService.revokeRole(userId, role, context) : Promise.reject('No user ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-grants', userId] });
      queryClient.invalidateQueries({ queryKey: ['effective-roles', userId] });
      queryClient.invalidateQueries({ queryKey: ['is-master-admin', userId] });
      toast.success('Rolle fjernet');
    },
    onError: (error) => {
      logger.error('Error revoking role:', {
        module: 'useRoleGrants',
        userId,
        action: 'revokeRole'
      }, error as Error);
      toast.error('Feil ved fjerning av rolle');
    },
  });

  const grantRole = (role: UserRole, context?: Record<string, any>) => {
    grantRoleMutation.mutate({ role, context });
  };

  const revokeRole = (role: UserRole, context?: Record<string, any>) => {
    revokeRoleMutation.mutate({ role, context });
  };

  const hasRole = (role: UserRole): boolean => {
    return effectiveRoles.includes(role);
  };

  const isLoading = isLoadingGrants || isLoadingRoles || isLoadingMasterAdmin;
  const error = grantsError || rolesError;

  return {
    roleGrants,
    effectiveRoles,
    isMasterAdmin,
    isLoading,
    error,
    grantRole,
    revokeRole,
    hasRole,
    isGranting: grantRoleMutation.isPending,
    isRevoking: revokeRoleMutation.isPending,
  };
}