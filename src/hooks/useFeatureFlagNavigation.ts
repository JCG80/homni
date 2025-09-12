/**
 * PHASE 2: Feature Flag Navigation Integration
 * Controls navigation visibility based on feature flags and rollout percentages
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useFeatureFlags, useFeatureFlag } from './useFeatureFlags';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';
import type { NavigationItem } from '@/types/consolidated-types';

interface FeatureFlagConfig {
  name: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
  description?: string;
}

/**
 * Hook to manage feature flag-based navigation
 */
export function useFeatureFlagNavigation() {
  const { user, role } = useAuth();
  const featureFlags = useFeatureFlags();
  
  /**
   * Check if a navigation item should be visible based on feature flags
   */
  const isNavItemVisible = useCallback((item: NavigationItem): boolean => {
    // If no feature flag specified, item is visible
    if (!item.featureFlag) return true;
    
    // Check if flag is enabled
    const isEnabled = featureFlags[item.featureFlag];
    if (!isEnabled) return false;
    
    // Additional checks could go here (rollout percentage, user groups, etc.)
    return true;
  }, [featureFlags]);
  
  /**
   * Filter navigation items based on feature flags
   */
  const filterNavigationByFlags = useCallback((items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      const isVisible = isNavItemVisible(item);
      
      // Recursively filter children
      if (item.children) {
        item.children = filterNavigationByFlags(item.children);
      }
      
      return isVisible;
    });
  }, [isNavItemVisible]);
  
  /**
   * Get feature flag configuration from database
   */
  const getFeatureFlagConfig = useCallback(async (flagName: string): Promise<FeatureFlagConfig | null> => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('name', flagName)
        .single();
      
      if (error || !data) return null;
      
      return {
        name: data.name,
        isEnabled: data.is_enabled,
        rolloutPercentage: data.rollout_percentage || 100,
        targetRoles: data.target_roles || [],
        description: data.description
      };
    } catch (error) {
      logger.error('Failed to fetch feature flag config', { flagName }, error);
      return null;
    }
  }, []);
  
  /**
   * Check if user is eligible for a feature based on rollout rules
   */
  const isUserEligibleForFeature = useCallback(async (flagName: string): Promise<boolean> => {
    if (!user || !role) return false;
    
    const config = await getFeatureFlagConfig(flagName);
    if (!config || !config.isEnabled) return false;
    
    // Check role targeting
    if (config.targetRoles.length > 0 && !config.targetRoles.includes(role)) {
      return false;
    }
    
    // Check rollout percentage (simple hash-based approach)
    if (config.rolloutPercentage < 100) {
      const userHash = hashUserId(user.id);
      const isInRollout = userHash % 100 < config.rolloutPercentage;
      if (!isInRollout) return false;
    }
    
    return true;
  }, [user, role, getFeatureFlagConfig]);
  
  return {
    isNavItemVisible,
    filterNavigationByFlags,
    isUserEligibleForFeature,
    getFeatureFlagConfig,
    enabledFlags: featureFlags
  };
}

/**
 * Hook for advanced feature flag management (admin only)
 */
export function useFeatureFlagManagement() {
  const { role } = useAuth();
  const canManageFlags = role === 'master_admin';
  
  /**
   * Create or update a feature flag
   */
  const upsertFeatureFlag = useCallback(async (
    name: string, 
    config: Partial<FeatureFlagConfig>
  ): Promise<boolean> => {
    if (!canManageFlags) {
      logger.warn('Unauthorized feature flag management attempt', { role });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('feature_flags')
        .upsert({
          name,
          is_enabled: config.isEnabled ?? true,
          rollout_percentage: config.rolloutPercentage ?? 100,
          target_roles: config.targetRoles ?? [],
          description: config.description,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      logger.info('Feature flag updated', { name, config });
      return true;
    } catch (error) {
      logger.error('Failed to update feature flag', { name, config }, error);
      return false;
    }
  }, [canManageFlags, role]);
  
  /**
   * Delete a feature flag
   */
  const deleteFeatureFlag = useCallback(async (name: string): Promise<boolean> => {
    if (!canManageFlags) {
      logger.warn('Unauthorized feature flag deletion attempt', { role });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('name', name);
      
      if (error) throw error;
      
      logger.info('Feature flag deleted', { name });
      return true;
    } catch (error) {
      logger.error('Failed to delete feature flag', { name }, error);
      return false;
    }
  }, [canManageFlags, role]);
  
  /**
   * Get all feature flags
   */
  const getAllFeatureFlags = useCallback(async (): Promise<FeatureFlagConfig[]> => {
    if (!canManageFlags) return [];
    
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(flag => ({
        name: flag.name,
        isEnabled: flag.is_enabled,
        rolloutPercentage: flag.rollout_percentage || 100,
        targetRoles: flag.target_roles || [],
        description: flag.description
      }));
    } catch (error) {
      logger.error('Failed to fetch all feature flags', {}, error);
      return [];
    }
  }, [canManageFlags]);
  
  return {
    canManageFlags,
    upsertFeatureFlag,
    deleteFeatureFlag,
    getAllFeatureFlags
  };
}

/**
 * Simple hash function for user ID to determine rollout eligibility
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Hook to check a single feature flag with advanced rollout logic
 */
export function useAdvancedFeatureFlag(flagName: string) {
  const { isEnabled, isLoading } = useFeatureFlag(flagName);
  const { isUserEligibleForFeature } = useFeatureFlagNavigation();
  
  const checkEligibility = useCallback(async () => {
    if (!isEnabled) return false;
    return await isUserEligibleForFeature(flagName);
  }, [isEnabled, flagName, isUserEligibleForFeature]);
  
  return {
    isEnabled,
    isLoading,
    checkEligibility
  };
}