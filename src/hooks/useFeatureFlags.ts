import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type FeatureFlags = Record<string, boolean>;

export const useFeatureFlag = (flagName: string, fallbackValue = false) => {
  const flags = useFeatureFlags();
  return {
    isEnabled: flags[flagName] ?? fallbackValue,
    isLoading: false
  };
};

export const useFeatureFlags = (): FeatureFlags => {
  const [flags, setFlags] = useState<FeatureFlags>({
    'lead:autoAssign': true,
    'admin:advancedStats': true,
    'company:bulkActions': false,
    'ui:newDesign': true,
    'ui:testPages': false,
    'debug:enabled': true,
    'ENABLE_ONBOARDING_WIZARD': true,
    'ENABLE_PROPERTY_MANAGEMENT': false,
    'ENABLE_DIY_SALES': false,
    'ENABLE_ANALYTICS_DASHBOARD': false,
  });

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