
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { ExtendedSystemModule, UserModule } from '../types/types';

/**
 * Hook to fetch user modules with their settings
 */
export const useUserModules = () => {
  const [modules, setModules] = useState<(ExtendedSystemModule & { userSettings?: UserModule })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserModules = async () => {
      if (!user) {
        setModules([]);
        setIsLoading(false);
        return;
      }
      
      try {
        // Call the RPC function to get enabled modules
        const { data: enabledModules, error: rpcError } = await supabase.rpc('get_user_enabled_modules');
        
        if (rpcError) throw rpcError;
        
        // Fetch additional module data to get all fields
        if (enabledModules && enabledModules.length > 0) {
          const moduleIds = enabledModules.map((m: any) => m.id);
          
          const { data: fullModules, error: modulesError } = await supabase
            .from('system_modules')
            .select('*')
            .in('id', moduleIds);
            
          if (modulesError) throw modulesError;
          
          // Fetch user-specific module settings
          const { data: userModules, error: userModulesError } = await supabase
            .from('user_modules')
            .select('*')
            .eq('user_id', user.id);
            
          if (userModulesError) throw userModulesError;
          
          // Combine the data with type safety
          const combinedModules = fullModules.map(module => {
            const userModule = userModules?.find(um => um.module_id === module.id);
            return {
              ...module,
              userSettings: userModule ? userModule as unknown as UserModule : undefined
            };
          });
          
          setModules(combinedModules as (ExtendedSystemModule & { userSettings?: UserModule })[]);
        } else {
          setModules([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user modules:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching user modules'));
        setModules([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserModules();
  }, [user]);
  
  return {
    modules,
    isLoading,
    error,
  };
};

/**
 * Hook to check if a user has access to a specific module
 */
export const useModuleAccess = (moduleName: string) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkModuleAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Call the RPC function to check module access
        const { data, error: rpcError } = await supabase.rpc('has_module_access', {
          module_name: moduleName
        });
        
        if (rpcError) throw rpcError;
        
        // data will be a boolean from the RPC function
        setHasAccess(data === true);
        setError(null);
      } catch (err) {
        console.error('Error checking module access:', err);
        setError(err instanceof Error ? err : new Error('Unknown error checking module access'));
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkModuleAccess();
  }, [moduleName, user]);
  
  return {
    hasAccess,
    isLoading,
    error,
  };
};
