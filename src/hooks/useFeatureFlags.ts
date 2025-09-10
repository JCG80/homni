import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_FEATURE_FLAGS, getDefaultFeatureFlagValue } from '@/config/featureFlags';

type FeatureFlags = Record<string, boolean>;

export const useFeatureFlag = (flagName: string, fallbackValue = false) => {
  const flags = useFeatureFlags();
  return {
    isEnabled: flags[flagName] ?? fallbackValue,
    isLoading: false
  };
};

export const useFeatureFlags = (): FeatureFlags => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const { data } = await supabase
          .from('feature_flags')
          .select('name, is_enabled')
          .eq('is_enabled', true);

        if (data) {
          const flagsMap = data.reduce((acc, flag) => ({
            ...acc,
            [flag.name]: flag.is_enabled
          }), {} as FeatureFlags);
          
          setFlags(prev => ({ ...prev, ...flagsMap }));
        }
      } catch (error) {
        console.warn('Failed to fetch feature flags, using defaults:', error);
      }
    };

    fetchFlags();
  }, []);

  return flags;
};