
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { canAccessModule } from '@/modules/auth/utils/roleUtils';

/**
 * Hook to check if a user has the necessary permissions to manage filters
 */
export function useFilterPermissions() {
  const { role } = useAuth();
  
  // Check if user has access to manage filters based on role
  const canManageFilters = role ? canAccessModule(role, 'leads') : false;
  
  return { canManageFilters };
}
