import { useEffect, useCallback, useState } from 'react'
import { supabase } from "@/integrations/supabase/client"

interface PerformanceMetrics {
  page_route: string
  load_time_ms: number
  first_contentful_paint?: number
  largest_contentful_paint?: number
  cumulative_layout_shift?: number
  first_input_delay?: number
  device_type: string
  network_type?: string
  metadata?: Record<string, any>
}

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

      // Insert into database
      await supabase.from('performance_monitoring').insert({
        ...performanceData,
        user_id: user?.id,
        session_id: sessionId
      })

    } catch (error) {
      console.error('Failed to track performance metrics:', error)
    }
  }, [pageName, sessionId])

  const trackSystemHealth = useCallback(async (metricName: string, value: number, unit: string = 'count') => {
    try {
      await supabase.from('system_health_metrics').insert({
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit,
        metadata: {
          page_route: pageName,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to track system health metric:', error)
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