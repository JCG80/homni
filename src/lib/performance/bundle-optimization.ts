/**
 * Advanced Bundle Optimization and Code Splitting
 */

import React, { lazy, ComponentType } from 'react';

// Dynamic import wrapper with error handling and loading states
export const createLazyComponent = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(() => 
    factory().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a fallback component instead of failing
      return {
        default: (fallback || (() => React.createElement('div', null, 'Failed to load component'))) as T
      };
    })
  );

  // Add display name for debugging (skip this as it's not supported)
  // LazyComponent.displayName = `LazyComponent(...)`;
  
  return LazyComponent;
};

// Route-based code splitting configuration
export const routeBasedSplitting = {
  // Admin routes - loaded only for admin users
  adminRoutes: () => import('@/pages/admin/AdminDashboard'),
  apiAdminPage: () => import('@/pages/admin/ApiAdminPage'),
  
  // Company routes - loaded only for company users
  companyDashboard: () => import('@/components/company/CompanyLeadDashboard'),
  
  // Analytics routes - heavy computation modules
  analyticsOverview: () => import('@/components/analytics/UserAnalyticsDashboard'),
  advancedAnalytics: () => import('@/components/analytics/AdminAnalyticsDashboard'),
};

// Feature-based code splitting
export const featureBasedSplitting = {
  // Core components that exist
  core: {
    dashboard: () => import('@/components/dashboard/ConsolidatedUserDashboard'),
    performance: () => import('@/components/performance/PerformanceOptimizer'),
  },
};

// Vendor code splitting optimization
export const vendorOptimization = {
  // Core React chunks
  react: ['react', 'react-dom', 'react-router-dom'],
  
  // UI framework
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-toast',
    '@radix-ui/react-tabs',
    'lucide-react',
  ],
  
  // Data fetching and state
  data: [
    '@tanstack/react-query',
    '@supabase/supabase-js',
    'zustand',
  ],
  
  // Charts and visualization
  charts: [
    'recharts',
    'react-chartjs-2',
    'chart.js',
  ],
  
  // Form handling
  forms: [
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
  ],
  
  // Date and utilities
  utils: [
    'date-fns',
    'lodash',
    'clsx',
    'class-variance-authority',
  ],
};

// Progressive loading strategies
export const progressiveLoading = {
  // Preload critical routes based on user role
  preloadCriticalRoutes: async (userRole: string) => {
    const preloadPromises: Promise<any>[] = [];
    
    // Always preload common components
    preloadPromises.push(
      routeBasedSplitting.adminRoutes(),
      featureBasedSplitting.core.dashboard()
    );
    
    // Role-specific preloading
    switch (userRole) {
      case 'admin':
      case 'master_admin':
        preloadPromises.push(
          routeBasedSplitting.adminRoutes(),
          routeBasedSplitting.analyticsOverview(),
          featureBasedSplitting.core.performance()
        );
        break;
        
      case 'company':
        preloadPromises.push(
          routeBasedSplitting.companyDashboard()
        );
        break;
        
      case 'user':
        preloadPromises.push(
          featureBasedSplitting.core.dashboard()
        );
        break;
    }
    
    // Load in background, don't block
    Promise.all(preloadPromises).catch(error => {
      console.warn('Failed to preload some routes:', error);
    });
  },
  
  // Intelligent prefetching based on user behavior
  predictiveLoading: {
    // Track user navigation patterns
    navigationPatterns: new Map<string, string[]>(),
    
    // Record navigation for prediction
    recordNavigation: (fromRoute: string, toRoute: string) => {
      const patterns = progressiveLoading.predictiveLoading.navigationPatterns;
      const currentPattern = patterns.get(fromRoute) || [];
      currentPattern.push(toRoute);
      
      // Keep only last 10 navigations
      if (currentPattern.length > 10) {
        currentPattern.shift();
      }
      
      patterns.set(fromRoute, currentPattern);
    },
    
    // Predict and preload likely next routes
    preloadPredictedRoutes: (currentRoute: string) => {
      const patterns = progressiveLoading.predictiveLoading.navigationPatterns;
      const pattern = patterns.get(currentRoute);
      
      if (!pattern || pattern.length === 0) return;
      
      // Find most common next route
      const routeCount = pattern.reduce((acc, route) => {
        acc[route] = (acc[route] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostLikelyRoute = Object.entries(routeCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      if (mostLikelyRoute && routeBasedSplitting[mostLikelyRoute as keyof typeof routeBasedSplitting]) {
        // Preload the predicted route
        (routeBasedSplitting[mostLikelyRoute as keyof typeof routeBasedSplitting] as any)()
          .catch(() => {
            // Silently fail - this is just optimization
          });
      }
    },
  },
};

// Bundle analysis utilities
export const bundleAnalysis = {
  // Analyze chunk sizes and performance
  analyzeChunks: () => {
    if (import.meta.env.DEV) {
      // In development, log chunk loading
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('chunk') || entry.name.includes('.js')) {
            console.log(`[CHUNK] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  },
  
  // Monitor bundle loading performance
  trackBundlePerformance: () => {
    const bundleMetrics = {
      totalChunks: 0,
      loadTime: 0,
      cacheHits: 0,
      errors: 0,
    };
    
    // Track resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          bundleMetrics.totalChunks++;
          bundleMetrics.loadTime += entry.duration;
          
          // Check for cache hits
          if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            bundleMetrics.cacheHits++;
          }
          
          // Track errors
          if (entry.responseStatus >= 400) {
            bundleMetrics.errors++;
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return bundleMetrics;
  },
  
  // Get bundle recommendations
  getBundleRecommendations: () => {
    const recommendations: string[] = [];
    
    // Check if user is on slow connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        recommendations.push('User on slow connection - consider lighter bundles');
      }
    }
    
    // Check memory constraints
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (memoryRatio > 0.8) {
        recommendations.push('High memory usage - avoid loading heavy components');
      }
    }
    
    return recommendations;
  },
};

// Initialize bundle optimization
export const initializeBundleOptimization = () => {
  // Start bundle analysis in development
  if (import.meta.env.DEV) {
    bundleAnalysis.analyzeChunks();
  }
  
  // Track bundle performance
  bundleAnalysis.trackBundlePerformance();
  
  // Set up intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const lazyLoadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const loadComponent = element.dataset.lazyComponent;
            
            if (loadComponent && routeBasedSplitting[loadComponent as keyof typeof routeBasedSplitting]) {
              (routeBasedSplitting[loadComponent as keyof typeof routeBasedSplitting] as any)();
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    // Export observer for use in components
    (window as any).lazyLoadObserver = lazyLoadObserver;
  }
};

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  initializeBundleOptimization();
}
