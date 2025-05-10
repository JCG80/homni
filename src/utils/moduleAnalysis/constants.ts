
/**
 * Default recommendations for module analysis
 */

export const DEFAULT_RECOMMENDATIONS = {
  apiPatterns: [
    'Standardize error handling using the ApiError class',
    'Use consistent return types across all API functions',
    'Implement proper TypeScript interfaces for all API responses',
    'Add proper loading state management to all API calls'
  ],
  componentPatterns: [
    'Use a consistent pattern for form handling',
    'Standardize component prop interfaces',
    'Extract common UI elements into shared components',
    'Implement consistent error handling in components'
  ],
  hooksPatterns: [
    'Use consistent naming for hook functions',
    'Standardize error and loading state management',
    'Extract common data fetching logic into shared hooks',
    'Implement proper cleanup in useEffect hooks'
  ]
};
