/**
 * Performance Configuration and Bundle Optimization
 */

export const performanceConfig = {
  // Critical resources to preload
  preloadResources: [
    '/src/components/ui/button.tsx',
    '/src/components/ui/card.tsx',
    '/src/components/layout/SiteLayout.tsx'
  ],
  
  // Lazy loading configuration
  lazyLoadThreshold: 0.1, // Intersection observer threshold
  
  // Cache configuration
  cacheConfig: {
    leadsCacheTTL: 5 * 60 * 1000, // 5 minutes
    analyticsCacheTTL: 15 * 60 * 1000, // 15 minutes
    userProfileCacheTTL: 30 * 60 * 1000 // 30 minutes
  },
  
  // Performance monitoring thresholds
  performanceThresholds: {
    renderTime: 16, // 60fps = 16ms per frame
    queryTime: 100, // Max 100ms for DB queries
    bundleSize: 200 * 1024, // 200KB max initial bundle
    memoryUsage: 50 * 1024 * 1024 // 50MB max memory
  },
  
  // Code splitting points
  splitPoints: [
    'dashboard',
    'admin',
    'analytics',
    'leads',
    'company'
  ]
};

/**
 * Bundle analysis configuration for Vite
 */
export const bundleAnalysisConfig = {
  // Analyze bundle on build
  analyze: process.env.ANALYZE === 'true',
  
  // Chunk size warnings
  chunkSizeWarningLimit: 500 * 1024, // 500KB
  
  // Manual chunks configuration
  manualChunks: (id: string) => {
    if (id.includes('node_modules')) {
      // Separate vendor chunks
      if (id.includes('react') || id.includes('react-dom')) {
        return 'react-vendor';
      }
      if (id.includes('@radix-ui') || id.includes('lucide-react')) {
        return 'ui-vendor';
      }
      if (id.includes('@supabase') || id.includes('@tanstack')) {
        return 'data-vendor';
      }
      return 'vendor';
    }
    
    // App chunks based on feature
    if (id.includes('/dashboard/')) return 'dashboard';
    if (id.includes('/admin/')) return 'admin';
    if (id.includes('/leads/')) return 'leads';
    if (id.includes('/analytics/')) return 'analytics';
    if (id.includes('/company/')) return 'company';
  }
};

/**
 * Runtime performance monitoring
 */
export const performanceMonitoring = {
  // Enable in development and production
  enabled: import.meta.env.DEV || import.meta.env.PROD,
  
  // Sample rate for performance entries
  sampleRate: import.meta.env.DEV ? 1.0 : 0.1, // 100% in dev, 10% in prod
  
  // Metrics to track
  metrics: [
    'navigation',
    'resource',
    'paint',
    'measure',
    'mark'
  ]
};