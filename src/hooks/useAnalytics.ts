import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, PerformanceMonitor } from '@/lib/analytics';
import { analyticsService, type AnalyticsEvent } from '@/lib/analytics/analyticsService';
import { useAuth } from '@/modules/auth/hooks';
import { logger } from '@/utils/logger';

export interface AnalyticsHook {
  trackEvent: (event: Omit<AnalyticsEvent, 'user_id'>) => Promise<void>;
  trackPageView: (page: string, properties?: Record<string, any>) => Promise<void>;
  trackInteraction: (element: string, action: string, properties?: Record<string, any>) => Promise<void>;
  trackConversion: (conversionType: string, value?: number, properties?: Record<string, any>) => Promise<void>;
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => Promise<void>;
  // New Master Prompt compliant methods
  trackLeadEvent: (action: string, leadId: string, additionalProps?: Record<string, any>) => void;
  trackPropertyEvent: (action: string, propertyId: string, additionalProps?: Record<string, any>) => void;
  startTimer: (name: string) => void;
  endTimer: (name: string, tags?: Record<string, string>) => void;
}

export const useAnalytics = (): AnalyticsHook => {
  const { user, role } = useAuth();
  const location = useLocation();

  // Track page views automatically on route changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Use both analytics systems for transition period
    analyticsService.trackPageView(currentPath, {
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      user_role: role
    });
    
    analytics.pageView(currentPath, document.title);
  }, [location.pathname, role]);

  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'user_id'>) => {
    try {
      await analyticsService.trackEvent({
        ...event,
        user_id: user?.id,
      });
    } catch (error) {
      logger.warn('Failed to track event', { error, event });
    }
  }, [user?.id]);

  const trackPageView = useCallback(async (page: string, properties?: Record<string, any>) => {
    try {
      await analyticsService.trackPageView(page, properties);
    } catch (error) {
      logger.warn('Failed to track page view', { error, page, properties });
    }
  }, []);

  const trackInteraction = useCallback(async (element: string, action: string, properties?: Record<string, any>) => {
    try {
      await analyticsService.trackInteraction(element, action, properties);
    } catch (error) {
      logger.warn('Failed to track interaction', { error, element, action, properties });
    }
  }, []);

  const trackConversion = useCallback(async (conversionType: string, value?: number, properties?: Record<string, any>) => {
    try {
      await analyticsService.trackConversion(conversionType, value, properties);
    } catch (error) {
      logger.warn('Failed to track conversion', { error, conversionType, value, properties });
    }
  }, []);

  const trackPerformance = useCallback(async (metric: string, value: number, properties?: Record<string, any>) => {
    try {
      await analyticsService.trackPerformance(metric, value, properties);
    } catch (error) {
      logger.warn('Failed to track performance', { error, metric, value, properties });
    }
  }, []);

  // Master Prompt compliant domain-specific tracking
  const trackLeadEvent = useCallback((action: string, leadId: string, additionalProps: Record<string, any> = {}) => {
    switch (action) {
      case 'created':
        analytics.leadCreated(leadId, additionalProps.category || 'unknown');
        break;
      case 'viewed':
        analytics.leadViewed(leadId);
        break;
      case 'status_changed':
        analytics.leadStatusChange(leadId, additionalProps.oldStatus, additionalProps.newStatus);
        break;
    }
  }, []);

  const trackPropertyEvent = useCallback((action: string, propertyId: string, additionalProps: Record<string, any> = {}) => {
    switch (action) {
      case 'created':
        analytics.propertyCreated(propertyId, additionalProps.type || 'unknown');
        break;
      case 'document_uploaded':
        analytics.documentUploaded(propertyId, additionalProps.documentType || 'unknown');
        break;
    }
  }, []);

  const startTimer = useCallback((name: string) => {
    PerformanceMonitor.startTimer(name);
  }, []);

  const endTimer = useCallback((name: string, tags?: Record<string, string>) => {
    PerformanceMonitor.endTimer(name, {
      ...tags,
      user_role: role,
      path: location.pathname
    });
  }, [role, location.pathname]);

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackConversion,
    trackPerformance,
    trackLeadEvent,
    trackPropertyEvent,
    startTimer,
    endTimer
  };
};