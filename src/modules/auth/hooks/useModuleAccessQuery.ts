import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ModuleAccessResult {
  moduleAccess: string[];
  isInternalAdmin: boolean;
}

/**
 * Hook to fetch user's module access from database
 * This replaces the metadata-based approach for proper security
 */
export const useModuleAccessQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['module-access', user?.id],
    queryFn: async (): Promise<ModuleAccessResult> => {
      if (!user?.id) {
        return { moduleAccess: [], isInternalAdmin: false };
      }

      const { data, error } = await supabase
        .from('module_access')
        .select('system_module_id, internal_admin')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching module access:', error);
        return { moduleAccess: [], isInternalAdmin: false };
      }

      const moduleAccess = (data || []).map(item => item.system_module_id);
      const isInternalAdmin = (data || []).some(item => item.internal_admin === true);

      return { moduleAccess, isInternalAdmin };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in newer react-query versions)
  });
};