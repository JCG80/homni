import React, { useCallback } from 'react';
import { logger } from '@/utils/logger';

interface VisitorEvent {
  visitor_role_selected: { role: 'private' | 'business' };
  visitor_step_view: { step: number; role: 'private' | 'business' };
  visitor_product_selected: { product: string; role: 'private' | 'business' };
  visitor_lead_submitted: { role: 'private' | 'business'; product: string; postnr: string };
}

type EventName = keyof VisitorEvent;

export const useVisitorAnalytics = () => {
  const trackEvent = useCallback(<T extends EventName>(
    eventName: T,
    data: VisitorEvent[T]
  ) => {
    try {
      // In development, log to console
      if (import.meta.env.MODE === 'development') {
        logger.debug(`Analytics Event: ${eventName}`, { eventName, data, type: 'analytics' });
      }

      // Store events in localStorage for now (can be enhanced with actual analytics service)
      const events = JSON.parse(localStorage.getItem('visitor_analytics') || '[]');
      events.push({
        event: eventName,
        data,
        timestamp: new Date().toISOString(),
        session: getSessionId()
      });
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('visitor_analytics', JSON.stringify(events));

      // Future: Send to actual analytics service
      // sendToAnalyticsService(eventName, data);
    } catch (error) {
      logger.warn('Analytics tracking failed', { error, eventName, data });
    }
  }, []);

  return { trackEvent };
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};
