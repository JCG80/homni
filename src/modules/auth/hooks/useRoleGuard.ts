
import { useRoleProtection } from './roles/useRoleProtection';
import { UserRole } from '../utils/roles';

interface UseRoleGuardOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  allowAnyAuthenticated?: boolean;
}

/**
 * @deprecated Use useRoleProtection instead
 * Legacy role guard hook for backward compatibility
 */
export const useRoleGuard = ({ 
  allowedRoles = [],
  redirectTo = '/unauthorized',
  allowAnyAuthenticated = false
}: UseRoleGuardOptions) => {
  return useRoleProtection({
    allowedRoles,
    redirectTo,
    allowAnyAuthenticated
  });
};
