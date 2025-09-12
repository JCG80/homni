import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

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

      // Fetch module access from user_modules table
      const { data: moduleData, error: moduleError } = await supabase
        .from('user_modules')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('is_enabled', true);

      if (moduleError) {
        logger.error('Error fetching module access', { error: moduleError });
        return { moduleAccess: [], isInternalAdmin: false };
      }

      // Fetch internal admin status via RPC
      const { data: isInternalAdminData, error: adminError } = await supabase
        .rpc('is_internal_admin', { check_user_id: user.id });

      if (adminError) {
        logger.error('Error fetching internal admin status', { error: adminError });
      }

      const moduleAccess = (moduleData || []).map(item => item.module_id);
      const isInternalAdmin = isInternalAdminData || false;

      return { moduleAccess, isInternalAdmin };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in newer react-query versions)
  });
};