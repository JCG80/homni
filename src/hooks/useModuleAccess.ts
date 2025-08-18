/**
 * Hook for checking module access in the plugin-driven architecture
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AuthService } from '@/services/authService';

interface UseModuleAccessOptions {
  modules: string[];
  refetch?: boolean;
}

interface UseModuleAccessReturn {
  access: Record<string, boolean>;
  enabledModules: any[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  canAccess: (moduleName: string) => boolean;
  hasAnyAccess: (moduleNames: string[]) => boolean;
}

export const useModuleAccess = ({ 
  modules, 
  refetch = false 
}: UseModuleAccessOptions): UseModuleAccessReturn => {
  const { user, isAuthenticated } = useAuth();
  const [accessStates, setAccessStates] = useState<Record<string, boolean>>({});
  const [enabledModules, setEnabledModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccess = async () => {
    if (!isAuthenticated || !user) {
      setAccessStates({});
      setEnabledModules([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check access for specific modules
      const accessPromises = modules.map(async (moduleName) => {
        const hasAccess = await AuthService.hasModuleAccess(moduleName, user.id);
        return [moduleName, hasAccess] as const;
      });

      const accessResults = await Promise.all(accessPromises);
      const newAccessStates = Object.fromEntries(accessResults);
      setAccessStates(newAccessStates);

      // Get all enabled modules for the user
      const userModules = await AuthService.getUserEnabledModules(user.id);
      setEnabledModules(userModules);
    } catch (error) {
      console.error('Error fetching module access:', error);
      setAccessStates({});
      setEnabledModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccess();
  }, [user?.id, isAuthenticated, modules.join(',')]);

  const canAccess = (moduleName: string): boolean => {
    return accessStates[moduleName] || false;
  };

  const hasAnyAccess = (moduleNames: string[]): boolean => {
    return moduleNames.some(moduleName => canAccess(moduleName));
  };

  return {
    access: accessStates,
    enabledModules,
    isLoading,
    refetch: fetchAccess,
    canAccess,
    hasAnyAccess
  };
};

/**
 * Hook for checking access to a single module
 */
export const useModuleAccessCheck = (moduleName: string): {
  canAccess: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const { access, isLoading, refetch } = useModuleAccess({ modules: [moduleName] });
  
  return {
    canAccess: access[moduleName] || false,
    isLoading,
    refetch
  };
};