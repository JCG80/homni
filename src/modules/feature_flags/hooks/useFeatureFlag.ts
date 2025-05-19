
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { FeatureFlag } from '../types/types';

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
  const { user, role } = useAuth();
  
  useEffect(() => {
    const checkFeatureEnabled = async () => {
      if (!user) {
        setIsEnabled(fallbackValue);
        setIsLoading(false);
        return;
      }
      
      try {
        // Call the RPC function directly
        const { data, error: rpcError } = await supabase.rpc('is_feature_enabled', {
          flag_name: flagName
        });
        
        if (rpcError) throw rpcError;
        
        // data will be a boolean from the RPC function
        setIsEnabled(data === true ? true : fallbackValue);
        setError(null);
      } catch (err) {
        console.error('Error checking feature flag:', err);
        setError(err instanceof Error ? err : new Error('Unknown error checking feature flag'));
        setIsEnabled(fallbackValue);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFeatureEnabled();
  }, [flagName, fallbackValue, user, role]);
  
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
        console.error('Error fetching feature flags:', err);
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
