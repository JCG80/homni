/**
 * Feature Flag Provider - Dynamic feature management
 * Part of Homni platform development plan
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { logger } from '@/utils/logger';

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: string[];
  target_companies: string[];
  conditions?: Record<string, any>;
}

interface FeatureFlagContextType {
  flags: FeatureFlag[];
  isEnabled: (flagName: string) => boolean;
  hasAccess: (flagName: string) => boolean;
  isLoading: boolean;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

interface FeatureFlagProviderProps {
  children: React.ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const { user, profile } = useIntegratedAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load feature flags from database
  const loadFeatureFlags = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('is_enabled', true);

      if (error) {
        logger.error('Failed to load feature flags:', error);
        return;
      }

      if (data) {
        const flagsWithDefaults = data.map((flag: any) => ({
          ...flag,
          target_companies: Array.isArray(flag.target_companies) ? flag.target_companies : []
        }));
        setFlags(flagsWithDefaults as FeatureFlag[]);
        logger.debug(`Loaded ${data.length} feature flags`);
      }
    } catch (error) {
      logger.error('Error loading feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a feature flag is enabled globally
  const isEnabled = (flagName: string): boolean => {
    const flag = flags.find(f => f.name === flagName);
    return flag ? flag.is_enabled : false;
  };

  // Check if user has access to a feature flag
  const hasAccess = (flagName: string): boolean => {
    const flag = flags.find(f => f.name === flagName);
    if (!flag || !flag.is_enabled) {
      return false;
    }

    // Check role-based access
    const userRole = profile?.role || 'user';
    if (flag.target_roles.length > 0 && !flag.target_roles.includes(userRole)) {
      return false;
    }

    // Check company-based access
    if (flag.target_companies.length > 0 && profile?.company_id) {
      if (!flag.target_companies.includes(profile.company_id)) {
        return false;
      }
    }

    // Check rollout percentage (simple hash-based approach)
    if (flag.rollout_percentage < 100 && user) {
      const hash = simpleHash(user.id + flag.name);
      const userPercentile = hash % 100;
      if (userPercentile >= flag.rollout_percentage) {
        return false;
      }
    }

    // Check additional conditions if specified
    if (flag.conditions) {
      // Add custom condition logic here if needed
      // For now, we'll assume conditions are met
    }

    return true;
  };

  // Refresh feature flags
  const refreshFlags = async () => {
    await loadFeatureFlags();
  };

  // Load flags on mount and when user changes
  useEffect(() => {
    loadFeatureFlags();
  }, [user?.id]);

  // Set up real-time subscription for feature flag changes
  useEffect(() => {
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => {
          logger.debug('Feature flags changed, reloading...');
          loadFeatureFlags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value: FeatureFlagContextType = {
    flags,
    isEnabled,
    hasAccess,
    isLoading,
    refreshFlags
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Simple hash function for rollout percentage
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}