
import { useAuth } from '@/modules/auth/hooks/useAuth';

/**
 * Hook to check if a user has the necessary permissions to manage filters
 */
export function useFilterPermissions() {
  const { role, canAccessModule } = useAuth();
  
  // Check if user has access to manage filters based on role
  const canManageFilters = role ? canAccessModule('leads') : false;
  
  return { canManageFilters };
}
