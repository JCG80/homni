import { useEffect, useCallback, useState } from 'react'
import { supabase } from "@/integrations/supabase/client"
import { PerformanceMetrics } from '@/types/metrics';
import { logger } from '@/utils/logger';

export const useProductionMonitoring = (pageName: string) => {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  const trackPerformanceMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get Web Vitals from Performance API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart

      // Get device info
      const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      const connection = (navigator as any).connection
      const networkType = connection?.effectiveType || 'unknown'

      const performanceData: PerformanceMetrics = {
        page_route: pageName,
        load_time_ms: Math.round(loadTime),
        loadTime: Math.round(loadTime), // Required field
        device_type: deviceType,
        network_type: networkType,
        metadata: {
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }
      }

      // Try to get Core Web Vitals if available
      if ('web-vitals' in window) {
        // Web Vitals would be measured here if library is available
        // For now, we'll use Performance Observer as fallback
      }

      setMetrics(performanceData)

      // Insert into database - only the fields that exist in the database
      await supabase.from('performance_metrics').insert({
        metric_name: `page_load_${pageName}`,
        metric_value: Math.round(loadTime),
        metric_unit: 'ms',
        service_name: 'frontend',
        metadata: performanceData.metadata
      })

    } catch (error) {
      logger.error('Failed to track performance metrics:', error)
    }
  }, [pageName, sessionId])

  const trackSystemHealth = useCallback(async (metricName: string, value: number, unit: string = 'count') => {
    try {
      await supabase.from('performance_metrics').insert({
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit,
        service_name: 'frontend',
        metadata: {
          page_route: pageName,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      logger.error('Failed to track system health metric:', error)
    }
  }, [pageName, sessionId])

  // Track page load performance on mount
  useEffect(() => {
    // Wait for page to fully load before measuring
    if (document.readyState === 'complete') {
      trackPerformanceMetrics()
    } else {
      window.addEventListener('load', trackPerformanceMetrics)
    }

    return () => {
      window.removeEventListener('load', trackPerformanceMetrics)
    }
  }, [trackPerformanceMetrics])

  return {
    metrics,
    trackSystemHealth,
    sessionId
  }
}