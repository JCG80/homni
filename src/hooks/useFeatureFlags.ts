import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_FEATURE_FLAGS, getDefaultFeatureFlagValue } from '@/config/featureFlags';

type FeatureFlags = Record<string, boolean>;

export const useFeatureFlag = (flagName: string, fallbackValue = false) => {
  const [isEnabled, setIsEnabled] = useState(fallbackValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFlag = async () => {
      try {
        // First check database
        const { data } = await supabase
          .from('feature_flags')
          .select('is_enabled')
          .eq('name', flagName)
          .single();

        if (data) {
          setIsEnabled(data.is_enabled);
        } else {
          // Fallback to config file
          setIsEnabled(getDefaultFeatureFlagValue(flagName));
        }
      } catch (error) {
        // Fallback to config file on error
        setIsEnabled(getDefaultFeatureFlagValue(flagName));
      } finally {
        setIsLoading(false);
      }
    };

    checkFlag();
  }, [flagName, fallbackValue]);

  return { isEnabled, isLoading };
};

export const useFeatureFlags = (): FeatureFlags => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const { data } = await supabase
          .from('feature_flags')
          .select('name, is_enabled');

        if (data) {
          const flagsMap = data.reduce((acc, flag) => ({
            ...acc,
            [flag.name]: flag.is_enabled
          }), {} as FeatureFlags);
          
          // Merge with defaults to ensure all flags have values
          setFlags({ ...DEFAULT_FEATURE_FLAGS, ...flagsMap });
        }
      } catch (error) {
        console.warn('Failed to fetch feature flags, using defaults:', error);
        setFlags(DEFAULT_FEATURE_FLAGS);
      }
    };

    fetchFlags();
  }, []);

  return flags;
};