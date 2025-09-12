
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/modules/auth/hooks';
import { FeatureFlag } from '../types/types';
import { logger } from '@/utils/logger';

/**
 * Hook to check if a feature flag is enabled for the current user
 * @param flagName The name of the feature flag to check
 * @param fallbackValue The value to return if the flag is not found or if there's an error
 * @returns An object containing the enabled status and loading/error states
 */
export const useFeatureFlag = (flagName: string, fallbackValue = false) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(fallbackValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkFeatureEnabled = async () => {
      if (!user) {
        setIsEnabled(fallbackValue);
        setIsLoading(false);
        return;
      }
      
      try {
        // Call the is_feature_enabled RPC function
        const { data, error: rpcError } = await supabase
          .rpc('is_feature_enabled', {
            flag_name: flagName
          });
        
        if (rpcError) throw rpcError;
        
        // RPC function returns a boolean
        setIsEnabled(data === true);
        setError(null);
      } catch (err) {
        logger.error('Error checking feature flag:', {
          module: 'useFeatureFlag',
          flagName,
          userId: user?.id
        }, err as Error);
        setError(err instanceof Error ? err : new Error('Unknown error checking feature flag'));
        setIsEnabled(fallbackValue);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFeatureEnabled();
  }, [flagName, fallbackValue, user]);
  
  return {
    isEnabled,
    isLoading,
    error,
  };
};

/**
 * Hook to fetch all available feature flags for the user
 * @returns An object containing the flags and loading/error states
 */
export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchFlags = async () => {
      if (!user) {
        setFlags([]);
        setIsLoading(false);
        return;
      }
      
      try {
        // Use a direct query instead, since RPC is causing TS issues
        const { data, error: queryError } = await supabase
          .from('feature_flags')
          .select('*')
          .order('name');
        
        if (queryError) throw queryError;
        
        setFlags(data as FeatureFlag[] || []);
        setError(null);
      } catch (err) {
        logger.error('Error fetching feature flags:', {
          module: 'useFeatureFlags',
          userId: user?.id
        }, err as Error);
        setError(err instanceof Error ? err : new Error('Unknown error fetching feature flags'));
        setFlags([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlags();
  }, [user]);
  
  return {
    flags,
    isLoading,
    error,
  };
};
