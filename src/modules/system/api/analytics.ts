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
 * Get lead performance analytics (using existing tables)
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

    // Query existing leads table for basic metrics
    let query = supabase
      .from('leads')
      .select('id, status, category, created_at, company_id');

    if (dateRange?.from) {
      query = query.gte('created_at', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte('created_at', dateRange.to.toISOString());
    }

    const { data: leads, error } = await query;

    if (error) {
      throw new ApiError('fetchLeadPerformanceMetrics', error);
    }

    const totalLeads = leads?.length || 0;
    const assignedLeads = leads?.filter(l => l.company_id) || [];
    const successfulAssignments = assignedLeads.length;
    
    // Group by category
    const categoryStats = leads?.reduce((acc, lead) => {
      if (!acc[lead.category]) {
        acc[lead.category] = { total: 0, assigned: 0 };
      }
      acc[lead.category].total++;
      if (lead.company_id) acc[lead.category].assigned++;
      return acc;
    }, {} as Record<string, { total: number; assigned: number }>) || {};

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        count: stats.total,
        success_rate: stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_leads: totalLeads,
      successful_assignments: successfulAssignments,
      failed_assignments: totalLeads - successfulAssignments,
      assignment_rate: totalLeads > 0 ? (successfulAssignments / totalLeads) * 100 : 0,
      average_assignment_time_hours: 2.5, // Mock value
      average_lead_value: 500, // Mock value
      top_categories: topCategories,
      conversion_funnel: {
        created: totalLeads,
        assigned: successfulAssignments,
        accepted: Math.floor(successfulAssignments * 0.8),
        in_progress: Math.floor(successfulAssignments * 0.6),
        completed: Math.floor(successfulAssignments * 0.4),
        converted: Math.floor(successfulAssignments * 0.3),
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

    // Query company profiles and leads for basic metrics
    const { data: companies, error: companiesError } = await supabase
      .from('company_profiles')
      .select('id, name, user_id, status')
      .eq('status', 'active')
      .limit(limit);

    if (companiesError) {
      throw new ApiError('fetchCompanyPerformanceMetrics', companiesError);
    }

    // Get leads for each company
    const metricsPromises = (companies || []).map(async (company) => {
      let leadsQuery = supabase
        .from('leads')
        .select('id, status, created_at')
        .eq('company_id', company.id);

      if (dateRange?.from) {
        leadsQuery = leadsQuery.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        leadsQuery = leadsQuery.lte('created_at', dateRange.to.toISOString());
      }

      const { data: leads } = await leadsQuery;
      const totalLeads = leads?.length || 0;
      const completedLeads = leads?.filter(l => l.status === 'converted').length || 0;
      
      return {
        company_id: company.id,
        company_name: company.name,
        total_leads_received: totalLeads,
        leads_accepted: totalLeads, // All received are assumed accepted for now
        leads_completed: completedLeads,
        acceptance_rate: 100, // Mock - all leads accepted
        completion_rate: totalLeads > 0 ? (completedLeads / totalLeads) * 100 : 0,
        average_response_time_hours: 4.5, // Mock value
        revenue_generated: completedLeads * 500, // Mock calculation
        customer_rating: 4.2, // Mock value
        active_leads: leads?.filter(l => ['new', 'qualified', 'contacted'].includes(l.status)).length || 0,
      };
    });

    return await Promise.all(metricsPromises);
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

    // Get basic metrics from existing tables
    const [leadsCount, companiesCount, errorsCount] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('company_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('error_tracking').select('id', { count: 'exact', head: true })
    ]);

    return {
      api_response_time_ms: 150, // Mock value
      database_performance_ms: 25, // Mock value  
      matching_engine_performance_ms: 300, // Mock value
      active_users_24h: companiesCount.count || 0,
      error_rate_percent: 0.5, // Mock value
      system_uptime_percent: 99.9, // Mock value
      resource_utilization: {
        cpu_percent: 45, // Mock value
        memory_percent: 62, // Mock value
        storage_percent: 23, // Mock value
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

    // Get analytics events if available, otherwise return mock data
    let query = supabase.from('analytics_events').select('user_id, event_name, created_at');
    
    if (dateRange?.from) {
      query = query.gte('created_at', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
      query = query.lte('created_at', dateRange.to.toISOString());
    }

    const { data: events } = await query;
    const uniqueUsers = new Set(events?.map(e => e.user_id).filter(Boolean)).size;

    return {
      total_active_users: uniqueUsers,
      new_users: Math.floor(uniqueUsers * 0.3), // Mock calculation
      returning_users: Math.floor(uniqueUsers * 0.7), // Mock calculation  
      user_retention_rate: 75.5, // Mock value
      most_used_features: [
        { feature: 'Lead Creation', usage_count: 150, unique_users: 45 },
        { feature: 'Dashboard View', usage_count: 200, unique_users: 60 },
        { feature: 'Profile Update', usage_count: 80, unique_users: 30 },
      ],
      user_journey_stats: [
        { step: 'Registration', completion_rate: 100, drop_off_rate: 0 },
        { step: 'Profile Setup', completion_rate: 85, drop_off_rate: 15 },
        { step: 'First Lead', completion_rate: 60, drop_off_rate: 25 },
      ],
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

    // Generate mock report with current timestamp
    const reportId = `report_${Date.now()}`;
    const generatedAt = new Date().toISOString();

    // Gather basic metrics based on what's requested
    const reportData: any = {};
    
    if (metrics.includes('leads')) {
      const leadsMetrics = await fetchLeadPerformanceMetrics();
      reportData.leads = leadsMetrics;
    }
    
    if (metrics.includes('companies')) {
      const companyMetrics = await fetchCompanyPerformanceMetrics(10);
      reportData.companies = companyMetrics;
    }
    
    if (metrics.includes('system')) {
      const systemMetrics = await fetchSystemHealthMetrics();
      reportData.system = systemMetrics;
    }

    return {
      report_id: reportId,
      report_type: reportType,
      generated_at: generatedAt,
      data: reportData,
    };
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's leads and company activity
    const [leadsToday, activeCompanies, recentLeads] = await Promise.all([
      supabase
        .from('leads')
        .select('id, company_id')
        .gte('created_at', today.toISOString()),
      supabase
        .from('company_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('leads')
        .select('id, title, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const leadsCount = leadsToday.data?.length || 0;
    const assignmentsCount = leadsToday.data?.filter(l => l.company_id).length || 0;

    return {
      leads_today: leadsCount,
      assignments_today: assignmentsCount,
      revenue_today: assignmentsCount * 500, // Mock calculation
      active_companies: activeCompanies.count || 0,
      system_status: 'healthy' as const,
      recent_activity: (recentLeads.data || []).map(lead => ({
        type: 'lead_created',
        message: `New lead: ${lead.title}`,
        timestamp: lead.created_at,
      })),
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

    // For now, just call the existing aggregation function
    const { error } = await supabase
      .rpc('aggregate_user_daily_activity');

    if (error) {
      logger.warn('Analytics aggregation setup failed, continuing...', { error });
    }

    return true;
  } catch (error) {
    logger.error('Failed to setup analytics aggregation', { module: 'analyticsApi' }, error);
    throw new ApiError('setupAnalyticsAggregation', error);
  }
}