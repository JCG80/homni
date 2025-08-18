/**
 * Hook for accessing feature flags with role-based controls
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AuthService } from '@/services/authService';

interface UseFeatureFlagsOptions {
  flags: string[];
  refetch?: boolean;
}

interface UseFeatureFlagsReturn {
  flags: Record<string, boolean>;
  isLoading: boolean;
  refetch: () => Promise<void>;
  isEnabled: (flagName: string) => boolean;
}

export const useFeatureFlags = ({ 
  flags, 
  refetch = false 
}: UseFeatureFlagsOptions): UseFeatureFlagsReturn => {
  const { user, isAuthenticated } = useAuth();
  const [flagStates, setFlagStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = async () => {
    if (!isAuthenticated || !user) {
      setFlagStates({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const flagPromises = flags.map(async (flagName) => {
        const enabled = await AuthService.isFeatureEnabled(flagName, user.id);
        return [flagName, enabled] as const;
      });

      const results = await Promise.all(flagPromises);
      const newFlagStates = Object.fromEntries(results);
      setFlagStates(newFlagStates);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      setFlagStates({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [user?.id, isAuthenticated, flags.join(',')]);

  const isEnabled = (flagName: string): boolean => {
    return flagStates[flagName] || false;
  };

  return {
    flags: flagStates,
    isLoading,
    refetch: fetchFlags,
    isEnabled
  };
};

/**
 * Hook for checking a single feature flag
 */
export const useFeatureFlag = (flagName: string): {
  isEnabled: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const { flags, isLoading, refetch } = useFeatureFlags({ flags: [flagName] });
  
  return {
    isEnabled: flags[flagName] || false,
    isLoading,
    refetch
  };
};