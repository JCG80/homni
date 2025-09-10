/**
 * Real User Metrics (RUM) Implementation
 * Comprehensive performance tracking for production environments
 */

import { track, trackPerformance } from '@/lib/analytics';

export interface CoreWebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
}

export interface UserMetrics {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  errors: number;
  customEvents: Record<string, number>;
}

class RealUserMetricsCollector {
  private static instance: RealUserMetricsCollector;
  private metrics: Partial<CoreWebVitals> = {};
  private userMetrics: UserMetrics = {
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
    errors: 0,
    customEvents: {}
  };
  private sessionStart = Date.now();
  private observers: PerformanceObserver[] = [];

  static getInstance(): RealUserMetricsCollector {
    if (!RealUserMetricsCollector.instance) {
      RealUserMetricsCollector.instance = new RealUserMetricsCollector();
    }
    return RealUserMetricsCollector.instance;
  }

  initialize(): void {
    this.collectCoreWebVitals();
    this.trackUserInteractions();
    this.trackNetworkMetrics();
    this.trackResourceLoading();
    this.setupErrorTracking();
    this.scheduleReporting();
  }

  private collectCoreWebVitals(): void {
    // First Contentful Paint
    this.observeMetric('paint', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          trackPerformance({
            name: 'core_web_vitals_fcp',
            value: entry.startTime,
            unit: 'ms'
          });
        }
      }
    });

    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      trackPerformance({
        name: 'core_web_vitals_lcp',
        value: lastEntry.startTime,
        unit: 'ms'
      });
    });

    // Cumulative Layout Shift
    let clsScore = 0;
    this.observeMetric('layout-shift', (entries) => {
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
        }
      }
      this.metrics.cls = clsScore;
      trackPerformance({
        name: 'core_web_vitals_cls',
        value: clsScore,
        unit: 'count'
      });
    });

    // First Input Delay
    this.observeMetric('first-input', (entries) => {
      const firstInput = entries[0];
      this.metrics.fid = (firstInput as any).processingStart - firstInput.startTime;
      trackPerformance({
        name: 'core_web_vitals_fid',
        value: this.metrics.fid,
        unit: 'ms'
      });
    });

    // Time to First Byte (from Navigation Timing)
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        this.metrics.ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
        trackPerformance({
          name: 'core_web_vitals_ttfb',
          value: this.metrics.ttfb,
          unit: 'ms'
        });
      }
    }
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Could not observe metric ${type}:`, error);
    }
  }

  private trackUserInteractions(): void {
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.userMetrics.interactions++;
      }, { passive: true });
    });
  }

  private trackNetworkMetrics(): void {
    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        track('performance', 'api_call', {
          endpoint: args[0].toString(),
          duration,
          status: response.status
        });

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        track('performance', 'api_call', {
          endpoint: args[0].toString(),
          duration,
          status: 0
        });
        throw error;
      }
    };
  }

  private trackResourceLoading(): void {
    this.observeMetric('resource', (entries) => {
      for (const entry of entries) {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resource.duration > 1000) {
          trackPerformance({
            name: 'slow_resource_load',
            value: resource.duration,
            unit: 'ms',
            tags: {
              resource_type: resource.initiatorType,
              resource_name: resource.name.split('/').pop() || 'unknown'
            }
          });
        }

        // Track resource by type
        trackPerformance({
          name: `resource_load_${resource.initiatorType}`,
          value: resource.duration,
          unit: 'ms'
        });
      }
    });
  }

  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.userMetrics.errors++;
      track('system_event', 'javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.userMetrics.errors++;
      track('system_event', 'unhandled_promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private scheduleReporting(): void {
    // Report metrics every 30 seconds
    setInterval(() => {
      this.reportMetrics();
    }, 30000);

    // Report on page unload
    window.addEventListener('beforeunload', () => {
      this.reportFinalMetrics();
    });

    // Report on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reportMetrics();
      }
    });
  }

  private reportMetrics(): void {
    this.userMetrics.sessionDuration = Date.now() - this.sessionStart;
    this.userMetrics.pageViews = performance.getEntriesByType('navigation').length;

    // Report core web vitals summary
    track('performance', 'rum_core_web_vitals', {
      ...this.metrics,
      user_metrics: this.userMetrics,
      browser: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    });
  }

  private reportFinalMetrics(): void {
    this.reportMetrics();
    
    // Calculate session quality score
    const qualityScore = this.calculateSessionQuality();
    track('business_event', 'session_completed', {
      quality_score: qualityScore,
      duration: this.userMetrics.sessionDuration,
      interactions: this.userMetrics.interactions,
      errors: this.userMetrics.errors,
      core_web_vitals: this.metrics
    });
  }

  private calculateSessionQuality(): number {
    let score = 100;
    
    // Deduct for poor performance
    if (this.metrics.fcp && this.metrics.fcp > 2500) score -= 20;
    if (this.metrics.lcp && this.metrics.lcp > 4000) score -= 20;
    if (this.metrics.cls && this.metrics.cls > 0.25) score -= 20;
    if (this.metrics.fid && this.metrics.fid > 300) score -= 20;
    
    // Deduct for errors
    score -= Math.min(this.userMetrics.errors * 10, 40);
    
    // Bonus for engagement
    if (this.userMetrics.interactions > 10) score += 5;
    if (this.userMetrics.sessionDuration > 60000) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Public methods for manual tracking
  trackCustomEvent(eventName: string, value: number = 1): void {
    this.userMetrics.customEvents[eventName] = 
      (this.userMetrics.customEvents[eventName] || 0) + value;
  }

  getMetrics(): { coreWebVitals: Partial<CoreWebVitals>; userMetrics: UserMetrics } {
    return {
      coreWebVitals: { ...this.metrics },
      userMetrics: { ...this.userMetrics }
    };
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const rumCollector = RealUserMetricsCollector.getInstance();

// Auto-initialize in browser environments
if (typeof window !== 'undefined') {
  rumCollector.initialize();
}