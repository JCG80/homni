import { useCallback, useEffect } from 'react';
import { analyticsService, type AnalyticsEvent } from '@/lib/analytics/analyticsService';
import { useAuth } from '@/modules/auth/hooks';
import { logger } from '@/utils/logger';

export interface AnalyticsHook {
  trackEvent: (event: Omit<AnalyticsEvent, 'user_id'>) => Promise<void>;
  trackPageView: (page: string, properties?: Record<string, any>) => Promise<void>;
  trackInteraction: (element: string, action: string, properties?: Record<string, any>) => Promise<void>;
  trackConversion: (conversionType: string, value?: number, properties?: Record<string, any>) => Promise<void>;
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => Promise<void>;
}

export const useAnalytics = (): AnalyticsHook => {
  const { user } = useAuth();

  // Track page views automatically on route changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    analyticsService.trackPageView(currentPath, {
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    });
  }, [window.location.pathname]);

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

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackConversion,
    trackPerformance,
  };
};