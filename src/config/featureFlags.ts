/**
 * Feature Flag Configuration
 * 
 * This file defines the default state of feature flags for the application.
 * These flags control which Sprint 4-6 features are enabled.
 */

export const DEFAULT_FEATURE_FLAGS = {
  // Sprint 1-3 features (always enabled)
  ENABLE_LEAD_DISTRIBUTION: true,
  ENABLE_ADMIN_LEAD_DISTRIBUTION: true,
  
  // Sprint 4-6 features (disabled by default during stabilization)
  ENABLE_ANALYTICS_DASHBOARD: false,
  ENABLE_PROPERTY_MANAGEMENT: true,
  ENABLE_DIY_SALES: false,
  ENABLE_ONBOARDING_WIZARD: false,
  ENABLE_SMART_START: true,
  
  // Future features
  ENABLE_MARKETPLACE: false,
  ENABLE_ADVANCED_REPORTING: false,
} as const;

export type FeatureFlagName = keyof typeof DEFAULT_FEATURE_FLAGS;

/**
 * Get the default value for a feature flag
 */
export function getDefaultFeatureFlagValue(flagName: string): boolean {
  return (DEFAULT_FEATURE_FLAGS as any)[flagName] ?? false;
}