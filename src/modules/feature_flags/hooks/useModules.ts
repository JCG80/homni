
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
        // Using explicit type assertion for RPC call
        const { data: enabledModules, error: rpcError } = await supabase
          .rpc('get_user_enabled_modules') as { 
            data: { 
              id: string; 
              name: string; 
              description: string | null; 
              route: string | null; 
              settings: Record<string, any> 
            }[] | null, 
            error: Error | null 
          };
        
        if (rpcError) throw rpcError;
        
        // Transform the data into the expected format
        if (enabledModules && enabledModules.length > 0) {
          const combinedModules = enabledModules.map(module => {
            return {
              id: module.id,
              name: module.name,
              description: module.description || null,
              route: module.route || null,
              is_active: true,
              userSettings: {
                id: '',
                user_id: user.id,
                module_id: module.id,
                is_enabled: true,
                settings: module.settings || {},
                created_at: '',
                updated_at: ''
              }
            } as ExtendedSystemModule & { userSettings?: UserModule };
          });
          
          setModules(combinedModules);
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
        // Using explicit type assertion for RPC call
        const { data, error: rpcError } = await supabase
          .rpc('has_module_access', {
            module_name: moduleName
          }) as { data: boolean | null, error: Error | null };
        
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
