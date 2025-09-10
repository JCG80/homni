import { supabase } from '@/lib/supabaseClient';
import type { InsightsData, InsightsFilters, PostcodeStats, ServiceTypeStats } from '../types';

/**
 * Fetch comprehensive insights data for admin dashboards
 */
export const getInsightsData = async (filters?: InsightsFilters): Promise<{
  data: InsightsData | null;
  error: any;
}> => {
  try {
    let query = supabase
      .from('smart_start_submissions')
      .select(`
        *,
        leads!smart_start_submission_id(id, status, created_at)
      `);

    // Apply filters
    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.from)
        .lte('created_at', filters.dateRange.to);
    }

    if (filters?.postcode) {
      query = query.eq('postcode', filters.postcode);
    }

    if (filters?.isCompany !== undefined) {
      query = query.eq('is_company', filters.isCompany);
    }

    if (filters?.stepCompleted) {
      query = query.gte('step_completed', filters.stepCompleted);
    }

    const { data: submissions, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Process data into insights
    const insightsData = processInsightsData(submissions || []);
    
    return { data: insightsData, error: null };
  } catch (error) {
    console.error('Error fetching insights data:', error);
    return { data: null, error };
  }
};

/**
 * Get postcode statistics
 */
export const getPostcodeStats = async (): Promise<{
  data: PostcodeStats[] | null;
  error: any;
}> => {
  try {
    const { data: submissions, error } = await supabase
      .from('smart_start_submissions')
      .select('postcode, lead_created, created_at');

    if (error) throw error;

    // Process data to get postcode statistics
    const postcodeMap = new Map<string, { count: number; leadCount: number }>();
    
    (submissions || []).forEach(s => {
      const current = postcodeMap.get(s.postcode) || { count: 0, leadCount: 0 };
      current.count++;
      if (s.lead_created) current.leadCount++;
      postcodeMap.set(s.postcode, current);
    });

    const data: PostcodeStats[] = Array.from(postcodeMap.entries())
      .map(([postcode, stats]) => ({
        postcode,
        count: stats.count,
        leadCount: stats.leadCount,
        conversionRate: stats.count > 0 ? (stats.leadCount / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching postcode stats:', error);
    return { data: null, error };
  }
};

/**
 * Get service type statistics
 */
export const getServiceTypeStats = async (): Promise<{
  data: ServiceTypeStats[] | null;
  error: any;
}> => {
  try {
    const { data: submissions, error } = await supabase
      .from('smart_start_submissions')
      .select('requested_services, lead_created, created_at');

    if (error) throw error;

    // Process data to get service type statistics
    const serviceMap = new Map<string, { count: number; leadCount: number }>();
    
    (submissions || []).forEach(s => {
      if (s.requested_services && Array.isArray(s.requested_services)) {
        s.requested_services.forEach((service: string) => {
          const current = serviceMap.get(service) || { count: 0, leadCount: 0 };
          current.count++;
          if (s.lead_created) current.leadCount++;
          serviceMap.set(service, current);
        });
      }
    });

    const data: ServiceTypeStats[] = Array.from(serviceMap.entries())
      .map(([service, stats]) => ({
        service,
        count: stats.count,
        leadCount: stats.leadCount,
        conversionRate: stats.count > 0 ? (stats.leadCount / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching service type stats:', error);
    return { data: null, error };
  }
};

/**
 * Export insights data
 */
export const exportInsightsData = async (
  type: 'csv' | 'excel',
  filters?: InsightsFilters
): Promise<{ data: Blob | null; error: any }> => {
  try {
    const { data: insights, error: fetchError } = await getInsightsData(filters);
    
    if (fetchError) throw fetchError;
    if (!insights) throw new Error('No data to export');

    // Convert to CSV format
    const csvData = convertToCSV(insights);
    const blob = new Blob([csvData], { type: 'text/csv' });
    
    return { data: blob, error: null };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { data: null, error };
  }
};

/**
 * Process raw submissions data into insights format
 */
function processInsightsData(submissions: any[]): InsightsData {
  const totalSubmissions = submissions.length;
  const leadsCreated = submissions.filter(s => s.lead_created).length;
  const conversionRate = totalSubmissions > 0 ? (leadsCreated / totalSubmissions) * 100 : 0;

  // Group by postcode
  const postcodeMap = new Map<string, { submissions: number; leads: number }>();
  submissions.forEach(s => {
    const current = postcodeMap.get(s.postcode) || { submissions: 0, leads: 0 };
    current.submissions++;
    if (s.lead_created) current.leads++;
    postcodeMap.set(s.postcode, current);
  });

  const topPostcodes: PostcodeStats[] = Array.from(postcodeMap.entries())
    .map(([postcode, stats]) => ({
      postcode,
      count: stats.submissions,
      leadCount: stats.leads,
      conversionRate: stats.submissions > 0 ? (stats.leads / stats.submissions) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Group by service type
  const serviceMap = new Map<string, { submissions: number; leads: number }>();
  submissions.forEach(s => {
    if (s.requested_services && s.requested_services.length > 0) {
      s.requested_services.forEach((service: string) => {
        const current = serviceMap.get(service) || { submissions: 0, leads: 0 };
        current.submissions++;
        if (s.lead_created) current.leads++;
        serviceMap.set(service, current);
      });
    }
  });

  const topServices: ServiceTypeStats[] = Array.from(serviceMap.entries())
    .map(([service, stats]) => ({
      service,
      count: stats.submissions,
      leadCount: stats.leads,
      conversionRate: stats.submissions > 0 ? (stats.leads / stats.submissions) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSubmissions,
    totalLeads: leadsCreated,
    conversionRate,
    topPostcodes,
    topServices,
    dailyStats: [], // Would need more complex processing
    unmatchedNeeds: [] // Would need company data to determine gaps
  };
}

/**
 * Convert insights data to CSV format
 */
function convertToCSV(data: InsightsData): string {
  const headers = ['Date', 'Total Submissions', 'Total Leads', 'Conversion Rate'];
  const rows = [`"${new Date().toISOString()}"`, data.totalSubmissions, data.totalLeads, `${data.conversionRate.toFixed(2)}%`];
  
  return [headers.join(','), rows.join(',')].join('\n');
}