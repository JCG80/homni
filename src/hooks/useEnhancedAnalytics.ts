import { useCallback } from 'react';
import { useAnalytics } from '@/lib/analytics/react';
import { UserRole } from '@/components/landing/VisitorWizard';
import { logger } from '@/utils/logger';

export const useEnhancedAnalytics = () => {
  const { track } = useAnalytics();
  
  const trackEvent = useCallback((eventName: string, data: Record<string, any>) => {
    track(eventName, data);
  }, [track]);
  
  const trackStepPerformance = useCallback((step: number, role: UserRole, timeSpent: number) => {
    // Track step completion time for optimization - store locally for now
    logger.debug(`Step ${step} performance:`, { role, timeSpent: Math.round(timeSpent / 1000) });
    
    track('step_performance', {
      step,
      role,
      timeSpent: Math.round(timeSpent / 1000),
    });
    
    // Store performance data locally
    const performanceData = JSON.parse(localStorage.getItem('wizard_performance') || '[]');
    performanceData.push({
      step,
      role,
      timeSpent: Math.round(timeSpent / 1000),
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 entries
    if (performanceData.length > 50) {
      performanceData.splice(0, performanceData.length - 50);
    }
    
    localStorage.setItem('wizard_performance', JSON.stringify(performanceData));
  }, [track]);

  const trackFormValidationError = useCallback((step: number, field: string, error: string) => {
    logger.debug(`Validation error - Step ${step}, Field: ${field}, Error: ${error}`);
    track('form_validation_error', { step, field, error });
  }, [track]);

  const trackDropoff = useCallback((step: number, role: UserRole) => {
    const dropoffEvent = {
      event: 'visitor_dropoff',
      step,
      role,
      timestamp: new Date().toISOString()
    };
    
    track('visitor_dropoff', { step, role });
    
    // Store dropoff data
    const dropoffs = JSON.parse(localStorage.getItem('visitor_dropoffs') || '[]');
    dropoffs.push(dropoffEvent);
    localStorage.setItem('visitor_dropoffs', JSON.stringify(dropoffs.slice(-50))); // Keep last 50
  }, [track]);

  const trackConversionFunnel = useCallback((role: UserRole, service: string) => {
    const funnelData = {
      role,
      service,
      completedSteps: [],
      startTime: Date.now(),
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    
    track('conversion_funnel_start', funnelData);
    sessionStorage.setItem('conversion_funnel', JSON.stringify(funnelData));
  }, [track]);

  return {
    trackEvent,
    trackStepPerformance,
    trackFormValidationError,
    trackDropoff,
    trackConversionFunnel
  };
};
