/**
 * Analytics & OpenTelemetry Integration
 * Implements structured event tracking for Homni
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AnalyticsEvent {
  event_type: 'user_action' | 'system_event' | 'business_event' | 'performance';
  event_name: string;
  properties: Record<string, any>;
  user_id?: string;
  session_id?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  tags?: Record<string, string>;
}

let sessionId: string | null = null;

/**
 * Initialize analytics session
 */
export function initializeAnalytics(): void {
  sessionId = generateSessionId();
  
  // Track session start
  track('system_event', 'session_start', {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

/**
 * Track an analytics event
 */
export async function track(
  eventType: AnalyticsEvent['event_type'],
  eventName: string,
  properties: Record<string, any> = {},
  userId?: string
): Promise<void> {
  try {
    // Enrich with session context
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
    };

    // Store in Supabase
    await supabase.rpc('track_analytics_event', {
      p_event_type: eventType,
      p_event_name: eventName,
      p_properties: enrichedProperties,
      p_user_id: userId,
      p_session_id: sessionId,
    });

    // Development logging
    if (import.meta.env.MODE === 'development') {
      logger.debug(`📊 Analytics: ${eventType}/${eventName}`, {
        module: 'analytics',
        eventType,
        eventName,
        properties: enrichedProperties
      });
    }
  } catch (error) {
    logger.error('Analytics tracking error:', {
      module: 'analytics',
      eventType,
      eventName
    }, error as Error);
  }
}

/**
 * Track performance metrics
 */
export function trackPerformance(metric: PerformanceMetric): void {
  track('performance', metric.name, {
    value: metric.value,
    unit: metric.unit,
    ...metric.tags,
  });
}

/**
 * Track user actions (clicks, form submissions, etc.)
 */
export const analytics = {
  // Authentication events
  login: (method: string) => track('user_action', 'login', { method }),
  logout: () => track('user_action', 'logout'),
  register: (method: string, role: string) => track('user_action', 'register', { method, role }),
  
  // Navigation events  
  pageView: (path: string, title?: string) => track('user_action', 'page_view', { path, title }),
  moduleAccess: (moduleName: string) => track('user_action', 'module_access', { module: moduleName }),
  
  // Lead events
  leadCreated: (leadId: string, category: string) => 
    track('business_event', 'lead_created', { lead_id: leadId, category }),
  leadViewed: (leadId: string) => 
    track('user_action', 'lead_viewed', { lead_id: leadId }),
  leadStatusChange: (leadId: string, oldStatus: string, newStatus: string) =>
    track('business_event', 'lead_status_changed', { lead_id: leadId, old_status: oldStatus, new_status: newStatus }),
    
  // Property events (Boligmappa)
  propertyCreated: (propertyId: string, type: string) =>
    track('business_event', 'property_created', { property_id: propertyId, type }),
  documentUploaded: (propertyId: string, documentType: string) =>
    track('user_action', 'document_uploaded', { property_id: propertyId, document_type: documentType }),
    
  // Feature flag events
  featureFlagViewed: (flagName: string, enabled: boolean) =>
    track('system_event', 'feature_flag_checked', { flag_name: flagName, enabled }),
    
  // Performance monitoring
  apiCall: (endpoint: string, duration: number, status: number) =>
    track('performance', 'api_call', { endpoint, duration, status }),
  pageLoad: (path: string, duration: number) =>
    track('performance', 'page_load', { path, duration }),
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  static endTimer(name: string, tags?: Record<string, string>): void {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      trackPerformance({
        name,
        value: Math.round(duration),
        unit: 'ms',
        tags,
      });
      this.timers.delete(name);
    }
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    this.startTimer(name);
    return fn().finally(() => this.endTimer(name, tags));
  }
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Automatic page view tracking
 */
export function setupPageViewTracking(): void {
  // Track initial page view
  analytics.pageView(window.location.pathname, document.title);

  // Track history changes (SPA navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(() => analytics.pageView(window.location.pathname, document.title), 0);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => analytics.pageView(window.location.pathname, document.title), 0);
  };

  window.addEventListener('popstate', () => {
    setTimeout(() => analytics.pageView(window.location.pathname, document.title), 0);
  });
}