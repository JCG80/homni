/**
 * Feature Flags Service
 * Implements role-based feature rollout with client-side caching
 */

import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: string[];
  created_at: string;
  updated_at: string;
}

const FEATURE_FLAGS_CACHE_KEY = 'feature-flags';

/**
 * Hook to check if a feature is enabled for the current user
 */
export function useFeatureFlag(flagName: string): boolean {
  const { data: flags = [] } = useQuery({
    queryKey: [FEATURE_FLAGS_CACHE_KEY],
    queryFn: fetchFeatureFlags,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const flag = flags.find(f => f.name === flagName);
  
  if (!flag || !flag.is_enabled) {
    return false;
  }

  // Server-side evaluation via RPC for role checking and rollout
  return useQuery({
    queryKey: ['feature-flag-check', flagName],
    queryFn: () => checkFeatureFlag(flagName),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!flag,
  }).data ?? false;
}

/**
 * Hook to get all available feature flags
 */
export function useFeatureFlags() {
  return useQuery({
    queryKey: [FEATURE_FLAGS_CACHE_KEY],
    queryFn: fetchFeatureFlags,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch feature flags from database
 */
async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching feature flags:', error);
    throw error;
  }

  return data || [];
}

/**
 * Check if a specific feature is enabled for current user
 * Uses Supabase RPC for server-side role and rollout evaluation
 */
async function checkFeatureFlag(flagName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_feature_enabled', {
    flag_name: flagName
  });

  if (error) {
    console.error(`Error checking feature flag ${flagName}:`, error);
    return false;
  }

  return data === true;
}

/**
 * Admin function to update a feature flag
 * Note: cache will refresh on next staleTime; callers can manually invalidate if needed.
 */
export async function updateFeatureFlag(
  flagId: string, 
  updates: Partial<Pick<FeatureFlag, 'is_enabled' | 'rollout_percentage' | 'target_roles'>>
) {
  const { error } = await supabase
    .from('feature_flags')
    .update(updates)
    .eq('id', flagId);

  if (error) {
    throw error;
  }
}

/**
 * Predefined feature flags for Homni modules
 */
export const HOMNI_FEATURES = {
  LEADS_MODULE: 'leads-module',
  BOLIGMAPPA_MODULE: 'boligmappa-module', 
  PROPR_MODULE: 'propr-module',
  AI_INTEGRATION: 'ai-integration',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  MARKETPLACE: 'lead-marketplace',
} as const;

export type HomniFeature = typeof HOMNI_FEATURES[keyof typeof HOMNI_FEATURES];