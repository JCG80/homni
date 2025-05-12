
import { useRoleNavigation } from './roles/useRoleNavigation';

/**
 * @deprecated Use useRoleNavigation instead
 * Hook that redirects users to the appropriate dashboard based on their role
 * @param redirectPathOverride Optional override for the redirect path
 */
export const useRoleRedirect = (redirectPathOverride?: string) => {
  return useRoleNavigation({ redirectPath: redirectPathOverride });
};
