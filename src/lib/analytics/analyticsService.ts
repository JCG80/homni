import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AnalyticsEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, any>;
  user_id?: string;
  session_id?: string;
}

export interface MetricData {
  metric_name: string;
  metric_value: number;
  dimensions?: Record<string, any>;
  date_recorded?: string;
}

export interface UserActivitySummary {
  user_id: string;
  date_summary: string;
  total_events: number;
  session_count: number;
  time_spent_minutes: number;
  features_used: any;
  conversion_events: number;
}

class AnalyticsService {
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isProcessing = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSessionTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSessionTracking(): void {
    // Track page views automatically
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  /**
   * Track a custom analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const eventWithSession = {
        ...event,
        session_id: event.session_id || this.sessionId,
      };

      // Add to queue for batch processing
      this.eventQueue.push(eventWithSession);

      // Process immediately for important events
      if (this.isImportantEvent(event.event_name)) {
        await this.flush();
      } else {
        // Process in batches
        this.scheduleFlush();
      }
    } catch (error) {
      logger.warn('Failed to track analytics event', { error, event });
    }
  }

  /**
   * Track page view
   */
  async trackPageView(page: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'navigation',
      event_name: 'page_view',
      properties: {
        page,
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
  }

  /**
   * Track user interaction
   */
  async trackInteraction(element: string, action: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'interaction',
      event_name: `${element}_${action}`,
      properties: {
        element,
        action,
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
  }

  /**
   * Track conversion event
   */
  async trackConversion(conversionType: string, value?: number, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'conversion',
      event_name: `conversion_${conversionType}`,
      properties: {
        conversion_type: conversionType,
        value,
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
  }

  /**
   * Track performance metric
   */
  async trackPerformance(metric: string, value: number, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_type: 'performance',
      event_name: `performance_${metric}`,
      properties: {
        metric,
        value,
        timestamp: new Date().toISOString(),
        ...properties,
      },
    });
  }

  /**
   * Record custom metric
   */
  async recordMetric(metricData: MetricData): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_name: metricData.metric_name,
          metric_value: metricData.metric_value,
          dimensions: metricData.dimensions || {},
          date_recorded: metricData.date_recorded || new Date().toISOString().split('T')[0],
        });

      if (error) {
        logger.warn('Failed to record metric', { error, metricData });
      }
    } catch (error) {
      logger.warn('Failed to record metric', { error, metricData });
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string, dateRange?: { start: string; end: string }): Promise<UserActivitySummary[]> {
    try {
      let query = supabase
        .from('user_activity_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('date_summary', { ascending: false });

      if (dateRange) {
        query = query
          .gte('date_summary', dateRange.start)
          .lte('date_summary', dateRange.end);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('Failed to get user activity summary', { error, userId, dateRange });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.warn('Failed to get user activity summary', { error, userId, dateRange });
      return [];
    }
  }

  /**
   * Get analytics metrics
   */
  async getMetrics(metricNames: string[], dateRange?: { start: string; end: string }): Promise<Record<string, any[]>> {
    try {
      let query = supabase
        .from('analytics_metrics')
        .select('*')
        .in('metric_name', metricNames)
        .order('date_recorded', { ascending: false });

      if (dateRange) {
        query = query
          .gte('date_recorded', dateRange.start)
          .lte('date_recorded', dateRange.end);
      }

      const { data, error } = await query;

      if (error) {
        logger.warn('Failed to get metrics', { error, metricNames, dateRange });
        return {};
      }

      // Group by metric name
      const grouped = (data || []).reduce((acc, metric) => {
        if (!acc[metric.metric_name]) {
          acc[metric.metric_name] = [];
        }
        acc[metric.metric_name].push(metric);
        return acc;
      }, {} as Record<string, any[]>);

      return grouped;
    } catch (error) {
      logger.warn('Failed to get metrics', { error, metricNames, dateRange });
      return {};
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) {
        logger.warn('Failed to get system health metrics', { error });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.warn('Failed to get system health metrics', { error });
      return [];
    }
  }

  /**
   * Flush queued events to database
   */
  private async flush(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToProcess);

      if (error) {
        logger.warn('Failed to flush analytics events', { error, eventsToProcess });
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToProcess);
      }
    } catch (error) {
      logger.warn('Failed to flush analytics events', { error, eventsToProcess });
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Schedule batch processing
   */
  private scheduleFlush(): void {
    if (this.eventQueue.length >= 10) {
      // Flush immediately if queue is getting large
      this.flush();
    } else {
      // Schedule flush after 5 seconds
      setTimeout(() => {
        this.flush();
      }, 5000);
    }
  }

  /**
   * Check if event should be processed immediately
   */
  private isImportantEvent(eventName: string): boolean {
    const importantEvents = [
      'conversion',
      'error',
      'lead_submitted',
      'payment_completed',
      'registration_completed',
    ];
    
    return importantEvents.some(important => eventName.includes(important));
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();