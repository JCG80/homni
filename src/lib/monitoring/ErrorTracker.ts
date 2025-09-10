/**
 * Error Tracking & Monitoring System
 * Comprehensive error tracking with user context and performance impact
 */

import { track } from '@/lib/analytics';
import { supabase } from '@/lib/supabaseClient';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  performanceImpact?: {
    memoryUsage: number;
    renderTime: number;
    networkLatency: number;
  };
}

export interface ErrorAnalytics {
  errorRate: number;
  topErrors: Array<{ message: string; count: number; lastSeen: string }>;
  errorsByBrowser: Record<string, number>;
  errorsByPage: Record<string, number>;
  performanceImpact: number;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorBuffer: ErrorReport[] = [];
  private maxBufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private sessionId = this.generateSessionId();

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  initialize(): void {
    this.setupGlobalErrorHandlers();
    this.setupUnhandledPromiseHandler();
    this.setupReactErrorBoundary();
    this.setupNetworkErrorTracking();
    this.setupPerformanceErrorTracking();
    this.scheduleErrorFlush();
  }

  private setupGlobalErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      const errorReport: ErrorReport = {
        id: this.generateErrorId(),
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        severity: this.determineSeverity(event.error),
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript_error',
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          connection: (navigator as any).connection?.effectiveType || 'unknown'
        },
        performanceImpact: this.getPerformanceImpact()
      };

      this.captureError(errorReport);
    });
  }

  private setupUnhandledPromiseHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const errorReport: ErrorReport = {
        id: this.generateErrorId(),
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        severity: 'high',
        context: {
          type: 'unhandled_promise_rejection',
          reason: event.reason,
          viewport: `${window.innerWidth}x${window.innerHeight}`
        },
        performanceImpact: this.getPerformanceImpact()
      };

      this.captureError(errorReport);
    });
  }

  private setupReactErrorBoundary(): void {
    // This would be used in React Error Boundaries
    (window as any).__errorTracker = this;
  }

  private setupNetworkErrorTracking(): void {
    // Override fetch to track network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Track HTTP errors
        if (!response.ok) {
          const errorReport: ErrorReport = {
            id: this.generateErrorId(),
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            severity: response.status >= 500 ? 'high' : 'medium',
            context: {
              type: 'network_error',
              endpoint: args[0].toString(),
              status: response.status,
              statusText: response.statusText,
              method: (args[1] as any)?.method || 'GET'
            }
          };

          this.captureError(errorReport);
        }

        return response;
      } catch (error) {
        const errorReport: ErrorReport = {
          id: this.generateErrorId(),
          message: `Network Request Failed: ${error}`,
          stack: (error as Error).stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          severity: 'high',
          context: {
            type: 'network_request_failed',
            endpoint: args[0].toString(),
            method: (args[1] as any)?.method || 'GET',
            error: (error as Error).message
          }
        };

        this.captureError(errorReport);
        throw error;
      }
    };
  }

  private setupPerformanceErrorTracking(): void {
    // Track performance issues as errors
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 4000) {
            this.capturePerformanceError('Slow LCP', entry.startTime, 'lcp');
          }
          if (entry.entryType === 'first-input' && (entry as any).processingStart - entry.startTime > 300) {
            this.capturePerformanceError('High FID', (entry as any).processingStart - entry.startTime, 'fid');
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        console.warn('Performance observer not supported');
      }
    }
  }

  private capturePerformanceError(message: string, value: number, metric: string): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: `Performance Issue: ${message}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      severity: 'medium',
      context: {
        type: 'performance_error',
        metric,
        value,
        threshold_exceeded: true
      }
    };

    this.captureError(errorReport);
  }

  public captureError(errorReport: ErrorReport): void {
    // Add to buffer
    this.errorBuffer.push(errorReport);

    // Immediate flush for critical errors
    if (errorReport.severity === 'critical') {
      this.flushErrors();
    }

    // Manage buffer size
    if (this.errorBuffer.length >= this.maxBufferSize) {
      this.flushErrors();
    }

    // Track in analytics
    track('system_event', 'error_captured', {
      error_id: errorReport.id,
      severity: errorReport.severity,
      message: errorReport.message,
      context: errorReport.context
    });
  }

  public captureException(error: Error, context: Record<string, any> = {}): void {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(error),
      context: {
        type: 'manual_capture',
        ...context
      },
      performanceImpact: this.getPerformanceImpact()
    };

    this.captureError(errorReport);
  }

  public setUser(userId: string): void {
    this.errorBuffer.forEach(error => {
      if (!error.userId) {
        error.userId = userId;
      }
    });
  }

  public addContext(key: string, value: any): void {
    // Add context to future error reports
    (window as any).__errorTrackerContext = {
      ...(window as any).__errorTrackerContext || {},
      [key]: value
    };
  }

  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errorsToFlush = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      // Store errors as analytics events
      for (const err of errorsToFlush) {
        await track('system_event', 'error_report', {
          error_id: err.id,
          message: err.message,
          stack_trace: err.stack,
          url: err.url,
          severity: err.severity,
          context: err.context,
          performance_impact: err.performanceImpact
        }, err.userId);
      }
    } catch (error) {
      console.error('Failed to flush errors:', error);
      // Re-add to buffer for retry
      this.errorBuffer.unshift(...errorsToFlush);
    }
  }

  private scheduleErrorFlush(): void {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushErrors();
    });
  }

  public async getErrorAnalytics(dateRange?: { start: string; end: string }): Promise<ErrorAnalytics> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('properties, created_at')
        .eq('event_name', 'error_report');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data: events, error } = await query;
      const errors = events?.map(e => e.properties as any) || [];
      
      if (error) throw error;

      const totalEvents = await this.getTotalEvents(dateRange);
      const errorCount = errors?.length || 0;

      const analytics: ErrorAnalytics = {
        errorRate: totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0,
        topErrors: this.aggregateTopErrors(errors || []),
        errorsByBrowser: this.aggregateErrorsByBrowser(errors || []),
        errorsByPage: this.aggregateErrorsByPage(errors || []),
        performanceImpact: this.calculatePerformanceImpact(errors || [])
      };

      return analytics;
    } catch (error) {
      console.error('Failed to get error analytics:', error);
      throw error;
    }
  }

  private async getTotalEvents(dateRange?: { start: string; end: string }): Promise<number> {
    let query = supabase.from('analytics_events').select('id', { count: 'exact' });
    
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }

    const { count } = await query;
    return count || 0;
  }

  private aggregateTopErrors(errors: any[]): Array<{ message: string; count: number; lastSeen: string }> {
    const errorMap = new Map<string, { count: number; lastSeen: string }>();
    
    errors.forEach(error => {
      const key = error.message;
      if (errorMap.has(key)) {
        const existing = errorMap.get(key)!;
        existing.count++;
        if (error.created_at > existing.lastSeen) {
          existing.lastSeen = error.created_at;
        }
      } else {
        errorMap.set(key, { count: 1, lastSeen: error.created_at });
      }
    });

    return Array.from(errorMap.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private aggregateErrorsByBrowser(errors: any[]): Record<string, number> {
    const browserMap: Record<string, number> = {};
    
    errors.forEach(error => {
      const browser = this.extractBrowser(error.user_agent);
      browserMap[browser] = (browserMap[browser] || 0) + 1;
    });

    return browserMap;
  }

  private aggregateErrorsByPage(errors: any[]): Record<string, number> {
    const pageMap: Record<string, number> = {};
    
    errors.forEach(error => {
      const path = new URL(error.url).pathname;
      pageMap[path] = (pageMap[path] || 0) + 1;
    });

    return pageMap;
  }

  private calculatePerformanceImpact(errors: any[]): number {
    const performanceErrors = errors.filter(e => e.performance_impact);
    if (performanceErrors.length === 0) return 0;

    const avgMemoryUsage = performanceErrors.reduce((sum, e) => 
      sum + (e.performance_impact.memoryUsage || 0), 0) / performanceErrors.length;
    
    return Math.round(avgMemoryUsage / 1024 / 1024); // Convert to MB
  }

  private determineSeverity(error: Error | null): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'low';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'high';
    if (message.includes('permission') || message.includes('security')) return 'critical';
    if (message.includes('memory') || message.includes('performance')) return 'medium';
    
    return 'medium';
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getPerformanceImpact() {
    return {
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      renderTime: performance.now(),
      networkLatency: this.estimateNetworkLatency()
    };
  }

  private estimateNetworkLatency(): number {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigationTiming ? navigationTiming.responseStart - navigationTiming.requestStart : 0;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Auto-initialize in browser environments
if (typeof window !== 'undefined') {
  errorTracker.initialize();
}

// React Error Boundary helper
export const captureReactError = (error: Error, errorInfo: any) => {
  errorTracker.captureException(error, {
    type: 'react_error_boundary',
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  });
};