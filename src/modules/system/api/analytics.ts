import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

/**
 * System Analytics API - Lead performance tracking
 */

export interface LeadPerformanceMetrics {
  total_leads: number;
  successful_assignments: number;
  failed_assignments: number;
  assignment_rate: number;
  average_assignment_time_hours: number;
  average_lead_value: number;
  top_categories: Array<{
    category: string;
    count: number;
    success_rate: number;
  }>;
  conversion_funnel: {
    created: number;
    assigned: number;
    accepted: number;
    in_progress: number;
    completed: number;
    converted: number;
  };
}

export interface CompanyPerformanceMetrics {
  company_id: string;
  company_name: string;
  total_leads_received: number;
  leads_accepted: number;
  leads_completed: number;
  acceptance_rate: number;
  completion_rate: number;
  average_response_time_hours: number;
  revenue_generated: number;
  customer_rating: number;
  active_leads: number;
}

export interface SystemHealthMetrics {
  api_response_time_ms: number;
  database_performance_ms: number;
  matching_engine_performance_ms: number;
  active_users_24h: number;
  error_rate_percent: number;
  system_uptime_percent: number;
  resource_utilization: {
    cpu_percent: number;
    memory_percent: number;
    storage_percent: number;
  };
}

/**
 * Get lead performance analytics
 */
export async function fetchLeadPerformanceMetrics(dateRange?: {
  from: Date;
  to: Date;
}): Promise<LeadPerformanceMetrics> {
  try {
    logger.info('Fetching lead performance metrics', { 
      module: 'analyticsApi', 
      dateRange 
    });

    const { data, error } = await supabase
      .rpc('get_lead_performance_metrics', {
        start_date: dateRange?.from?.toISOString() || null,
        end_date: dateRange?.to?.toISOString() || null,
      });

    if (error) {
      throw new ApiError('fetchLeadPerformanceMetrics', error);
    }

    return data || {
      total_leads: 0,
      successful_assignments: 0,
      failed_assignments: 0,
      assignment_rate: 0,
      average_assignment_time_hours: 0,
      average_lead_value: 0,
      top_categories: [],
      conversion_funnel: {
        created: 0,
        assigned: 0,
        accepted: 0,
        in_progress: 0,
        completed: 0,
        converted: 0,
      },
    };
  } catch (error) {
    logger.error('Failed to fetch lead performance metrics', { module: 'analyticsApi' }, error);
    throw new ApiError('fetchLeadPerformanceMetrics', error);
  }
}

/**
 * Get company performance rankings
 */
export async function fetchCompanyPerformanceMetrics(
  limit = 20,
  dateRange?: { from: Date; to: Date }
): Promise<CompanyPerformanceMetrics[]> {
  try {
    logger.info('Fetching company performance metrics', { 
      module: 'analyticsApi', 
      limit, 
      dateRange 
    });

    const { data, error } = await supabase
      .rpc('get_company_performance_metrics', {
        limit_param: limit,
        start_date: dateRange?.from?.toISOString() || null,
        end_date: dateRange?.to?.toISOString() || null,
      });

    if (error) {
      throw new ApiError('fetchCompanyPerformanceMetrics', error);
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch company performance metrics', { module: 'analyticsApi' }, error);
    throw new ApiError('fetchCompanyPerformanceMetrics', error);
  }
}

/**
 * Get system health metrics
 */
export async function fetchSystemHealthMetrics(): Promise<SystemHealthMetrics> {
  try {
    logger.info('Fetching system health metrics', { module: 'analyticsApi' });

    const { data, error } = await supabase
      .rpc('get_system_health_metrics');

    if (error) {
      throw new ApiError('fetchSystemHealthMetrics', error);
    }

    return data || {
      api_response_time_ms: 0,
      database_performance_ms: 0,
      matching_engine_performance_ms: 0,
      active_users_24h: 0,
      error_rate_percent: 0,
      system_uptime_percent: 0,
      resource_utilization: {
        cpu_percent: 0,
        memory_percent: 0,
        storage_percent: 0,
      },
    };
  } catch (error) {
    logger.error('Failed to fetch system health metrics', { module: 'analyticsApi' }, error);
    throw new ApiError('fetchSystemHealthMetrics', error);
  }
}

/**
 * Track custom analytics event
 */
export async function trackAnalyticsEvent(
  eventType: string,
  eventName: string,
  properties: Record<string, any> = {},
  userId?: string
): Promise<boolean> {
  try {
    logger.info('Tracking analytics event', { 
      module: 'analyticsApi', 
      eventType, 
      eventName 
    });

    const { data, error } = await supabase
      .rpc('track_analytics_event', {
        p_event_type: eventType,
        p_event_name: eventName,
        p_properties: properties,
        p_user_id: userId || null,
      });

    if (error) {
      throw new ApiError('trackAnalyticsEvent', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to track analytics event', { module: 'analyticsApi' }, error);
    throw new ApiError('trackAnalyticsEvent', error);
  }
}

/**
 * Get user behavior analytics
 */
export async function fetchUserBehaviorAnalytics(dateRange?: {
  from: Date;
  to: Date;
}): Promise<{
  total_active_users: number;
  new_users: number;
  returning_users: number;
  user_retention_rate: number;
  most_used_features: Array<{
    feature: string;
    usage_count: number;
    unique_users: number;
  }>;
  user_journey_stats: Array<{
    step: string;
    completion_rate: number;
    drop_off_rate: number;
  }>;
}> {
  try {
    logger.info('Fetching user behavior analytics', { 
      module: 'analyticsApi', 
      dateRange 
    });

    const { data, error } = await supabase
      .rpc('get_user_behavior_analytics', {
        start_date: dateRange?.from?.toISOString() || null,
        end_date: dateRange?.to?.toISOString() || null,
      });

    if (error) {
      throw new ApiError('fetchUserBehaviorAnalytics', error);
    }

    return data || {
      total_active_users: 0,
      new_users: 0,
      returning_users: 0,
      user_retention_rate: 0,
      most_used_features: [],
      user_journey_stats: [],
    };
  } catch (error) {
    logger.error('Failed to fetch user behavior analytics', { module: 'analyticsApi' }, error);
    throw new ApiError('fetchUserBehaviorAnalytics', error);
  }
}

/**
 * Generate analytics report
 */
export async function generateAnalyticsReport(
  reportType: 'daily' | 'weekly' | 'monthly',
  metrics: string[] = ['leads', 'companies', 'system']
): Promise<{
  report_id: string;
  report_type: string;
  generated_at: string;
  data: any;
}> {
  try {
    logger.info('Generating analytics report', { 
      module: 'analyticsApi', 
      reportType, 
      metrics 
    });

    const { data, error } = await supabase
      .rpc('generate_analytics_report', {
        report_type_param: reportType,
        metrics_param: metrics,
      });

    if (error) {
      throw new ApiError('generateAnalyticsReport', error);
    }

    return data;
  } catch (error) {
    logger.error('Failed to generate analytics report', { module: 'analyticsApi' }, error);
    throw new ApiError('generateAnalyticsReport', error);
  }
}

/**
 * Get real-time dashboard metrics
 */
export async function fetchRealtimeDashboardMetrics(): Promise<{
  leads_today: number;
  assignments_today: number;
  revenue_today: number;
  active_companies: number;
  system_status: 'healthy' | 'warning' | 'critical';
  recent_activity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}> {
  try {
    logger.info('Fetching realtime dashboard metrics', { module: 'analyticsApi' });

    const { data, error } = await supabase
      .rpc('get_realtime_dashboard_metrics');

    if (error) {
      throw new ApiError('fetchRealtimeDashboardMetrics', error);
    }

    return data || {
      leads_today: 0,
      assignments_today: 0,
      revenue_today: 0,
      active_companies: 0,
      system_status: 'healthy',
      recent_activity: [],
    };
  } catch (error) {
    logger.error('Failed to fetch realtime dashboard metrics', { module: 'analyticsApi' }, error);
    throw new ApiError('fetchRealtimeDashboardMetrics', error);
  }
}

/**
 * Set up analytics data aggregation
 */
export async function setupAnalyticsAggregation(): Promise<boolean> {
  try {
    logger.info('Setting up analytics aggregation', { module: 'analyticsApi' });

    const { error } = await supabase
      .rpc('setup_analytics_aggregation');

    if (error) {
      throw new ApiError('setupAnalyticsAggregation', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to setup analytics aggregation', { module: 'analyticsApi' }, error);
    throw new ApiError('setupAnalyticsAggregation', error);
  }
}