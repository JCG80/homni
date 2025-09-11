/**
 * Analytics System - Main Entry Point
 * Provides event tracking and performance monitoring
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

// Simple analytics tracker
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
    // In production, this would send to analytics service
  },
  
  page: (path: string, title?: string) => {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page View:', path, title);
    }
    // Track page views
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Identify:', userId, traits);
    }
    // Identify user
  }
};

// Performance monitor
export const PerformanceMonitor = {
  mark: (name: string) => {
    if (performance && performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark: string) => {
    if (performance && performance.measure) {
      performance.measure(name, startMark, endMark);
    }
  },
  
  getEntries: () => {
    if (performance && performance.getEntriesByType) {
      return performance.getEntriesByType('measure');
    }
    return [];
  }
};

// Track function for compatibility
export const track = analytics.track;
export const trackPerformance = (name: string, value: number, unit = 'ms') => {
  if (import.meta.env.DEV) {
    console.log('[Performance]', name, value, unit);
  }
};

// Initialize analytics system
export const initializeAnalytics = () => {
  if (import.meta.env.DEV) {
    console.log('[Analytics] System initialized');
  }
  
  // Set up error tracking
  window.addEventListener('error', (event) => {
    track('JavaScript Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // Set up unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    track('Unhandled Promise Rejection', {
      reason: event.reason
    });
  });
};

// Set up page view tracking
export const setupPageViewTracking = () => {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Page view tracking enabled');
  }
  
  // Track initial page load
  analytics.page(window.location.pathname, document.title);
  
  // Track route changes (for SPA)
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      analytics.page(currentPath, document.title);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
};