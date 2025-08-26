import { useCallback, useEffect } from 'react';
import { useVisitorAnalytics } from '@/lib/analytics/visitorAnalytics';
import { UserRole } from '@/components/landing/VisitorWizard';

interface PerformanceMetrics {
  stepStartTime: number;
  stepCompletionTimes: Record<number, number>;
  totalTimeSpent: number;
}

export const useEnhancedAnalytics = () => {
  const { trackEvent } = useVisitorAnalytics();
  
  const trackStepPerformance = useCallback((step: number, role: UserRole, timeSpent: number) => {
    // Track step completion time for optimization - store locally for now
    console.log(`Step ${step} performance:`, { role, timeSpent: Math.round(timeSpent / 1000) });
    
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
  }, []);

  const trackFormValidationError = useCallback((step: number, field: string, error: string) => {
    console.log(`Validation error - Step ${step}, Field: ${field}, Error: ${error}`);
    // Store for analytics (could be sent to error tracking service)
  }, []);

  const trackDropoff = useCallback((step: number, role: UserRole) => {
    const dropoffEvent = {
      event: 'visitor_dropoff',
      step,
      role,
      timestamp: new Date().toISOString()
    };
    
    // Store dropoff data
    const dropoffs = JSON.parse(localStorage.getItem('visitor_dropoffs') || '[]');
    dropoffs.push(dropoffEvent);
    localStorage.setItem('visitor_dropoffs', JSON.stringify(dropoffs.slice(-50))); // Keep last 50
  }, []);

  const trackConversionFunnel = useCallback((role: UserRole, service: string) => {
    const funnelData = {
      role,
      service,
      completedSteps: [],
      startTime: Date.now(),
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    
    sessionStorage.setItem('conversion_funnel', JSON.stringify(funnelData));
  }, []);

  return {
    trackEvent,
    trackStepPerformance,
    trackFormValidationError,
    trackDropoff,
    trackConversionFunnel
  };
};