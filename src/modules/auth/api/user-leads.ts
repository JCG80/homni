import { supabase } from '@/lib/supabaseClient';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';
import type { LeadStatus } from '@/types/leads-canonical';

/**
 * User Leads API - User's lead tracking and status visibility
 */

export interface UserLeadSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  company_assigned?: {
    id: string;
    name: string;
    contact_email?: string;
    contact_phone?: string;
  };
  assignment_details?: {
    assigned_at: string;
    status: string;
    pipeline_stage: string;
    expires_at?: string;
  };
  response_received?: boolean;
  last_activity?: string;
}

export interface UserLeadStats {
  total_leads: number;
  active_leads: number;
  completed_leads: number;
  response_rate: number;
  average_response_time_hours: number;
  leads_by_status: Record<LeadStatus, number>;
  leads_by_category: Record<string, number>;
}

export interface LeadResponse {
  id: string;
  lead_id: string;
  company_id: string;
  company_name: string;
  message: string;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  quote_amount?: number;
  estimated_timeline?: string;
  response_type: 'quote' | 'interest' | 'decline' | 'request_info';
  created_at: string;
  is_read: boolean;
}

/**
 * Fetch all leads for authenticated user
 */
export async function fetchUserLeads(userId?: string): Promise<UserLeadSummary[]> {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    logger.info('Fetching user leads', { module: 'userLeadsApi', userId: targetUserId });

    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        updated_at,
        company_profiles:company_id (
          id,
          name,
          email,
          phone
        ),
        lead_assignments (
          assigned_at,
          status,
          pipeline_stage,
          expires_at
        )
      `)
      .eq('submitted_by', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError('fetchUserLeads', error);
    }

    // Transform data
    const transformedData = (data || []).map(lead => ({
      id: lead.id,
      title: lead.title,
      description: lead.description,
      category: lead.category,
      status: lead.status,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      company_assigned: lead.company_profiles ? {
        id: lead.company_profiles.id,
        name: lead.company_profiles.name,
        contact_email: lead.company_profiles.email,
        contact_phone: lead.company_profiles.phone,
      } : undefined,
      assignment_details: Array.isArray(lead.lead_assignments) && lead.lead_assignments.length > 0 
        ? {
            assigned_at: lead.lead_assignments[0].assigned_at,
            status: lead.lead_assignments[0].status,
            pipeline_stage: lead.lead_assignments[0].pipeline_stage,
            expires_at: lead.lead_assignments[0].expires_at,
          }
        : undefined,
      response_received: !!lead.company_profiles,
      last_activity: lead.updated_at,
    }));

    return dedupeByKey(transformedData, 'id');
  } catch (error) {
    logger.error('Failed to fetch user leads', { module: 'userLeadsApi' }, error);
    throw new ApiError('fetchUserLeads', error);
  }
}

/**
 * Get user lead statistics
 */
export async function fetchUserLeadStats(userId?: string): Promise<UserLeadStats> {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    logger.info('Fetching user lead statistics', { module: 'userLeadsApi', userId: targetUserId });

    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        status,
        category,
        created_at,
        updated_at,
        lead_assignments (
          assigned_at,
          status
        )
      `)
      .eq('submitted_by', targetUserId);

    if (error) {
      throw new ApiError('fetchUserLeadStats', error);
    }

    const stats: UserLeadStats = {
      total_leads: data.length,
      active_leads: 0,
      completed_leads: 0,
      response_rate: 0,
      average_response_time_hours: 0,
      leads_by_status: {} as Record<LeadStatus, number>,
      leads_by_category: {},
    };

    let totalResponseTime = 0;
    let responseCount = 0;
    let leadsWithResponses = 0;

    data.forEach(lead => {
      // Status counting
      stats.leads_by_status[lead.status as LeadStatus] = 
        (stats.leads_by_status[lead.status as LeadStatus] || 0) + 1;

      // Category counting  
      stats.leads_by_category[lead.category] = 
        (stats.leads_by_category[lead.category] || 0) + 1;

      // Active vs completed
      if (['converted', 'lost'].includes(lead.status)) {
        stats.completed_leads++;
      } else {
        stats.active_leads++;
      }

      // Response tracking
      const assignment = Array.isArray(lead.lead_assignments) 
        ? lead.lead_assignments[0] 
        : lead.lead_assignments;

      if (assignment) {
        leadsWithResponses++;
        
        if (assignment.assigned_at) {
          const responseTime = new Date(assignment.assigned_at).getTime() - 
            new Date(lead.created_at).getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    stats.response_rate = data.length > 0 ? (leadsWithResponses / data.length) * 100 : 0;
    stats.average_response_time_hours = responseCount > 0 
      ? (totalResponseTime / responseCount) / (1000 * 60 * 60) 
      : 0;

    return stats;
  } catch (error) {
    logger.error('Failed to fetch user lead stats', { module: 'userLeadsApi' }, error);
    throw new ApiError('fetchUserLeadStats', error);
  }
}

/**
 * Fetch responses received for user's leads
 */
export async function fetchLeadResponses(userId?: string): Promise<LeadResponse[]> {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    logger.info('Fetching lead responses', { module: 'userLeadsApi', userId: targetUserId });

    // For now, return empty array since lead_responses table doesn't exist yet
    // TODO: Create lead_responses table in future migration
    return [];
  } catch (error) {
    logger.error('Failed to fetch lead responses', { module: 'userLeadsApi' }, error);
    throw new ApiError('fetchLeadResponses', error);
  }
}

/**
 * Mark lead response as read
 */
export async function markResponseAsRead(responseId: string): Promise<boolean> {
  try {
    logger.info('Marking response as read', { module: 'userLeadsApi', responseId });
    // TODO: Implement when lead_responses table exists
    return true;
  } catch (error) {
    logger.error('Failed to mark response as read', { module: 'userLeadsApi' }, error);
    throw new ApiError('markResponseAsRead', error);
  }
}

/**
 * Link anonymous leads to user account
 */
export async function linkAnonymousLeads(userEmail: string): Promise<number> {
  try {
    logger.info('Linking anonymous leads', { module: 'userLeadsApi', userEmail });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .rpc('link_anonymous_leads_to_user', {
        user_id_param: user.user.id,
        user_email_param: userEmail,
      });

    if (error) {
      throw new ApiError('linkAnonymousLeads', error);
    }

    return data?.[0]?.linked_count || 0;
  } catch (error) {
    logger.error('Failed to link anonymous leads', { module: 'userLeadsApi' }, error);
    throw new ApiError('linkAnonymousLeads', error);
  }
}

/**
 * Subscribe to lead updates for user
 */
export function subscribeToUserLeadUpdates(
  userId: string,
  callback: (payload: any) => void
) {
  try {
    logger.info('Subscribing to user lead updates', { module: 'userLeadsApi', userId });

    const channel = supabase
      .channel(`user_leads_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `submitted_by=eq.${userId}`,
        },
        (payload) => {
          logger.info('User lead update detected', { 
            module: 'userLeadsApi', 
            userId, 
            event: payload.eventType 
          });
          callback(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_assignments',
        },
        (payload) => {
          logger.info('Lead assignment update detected', { 
            module: 'userLeadsApi', 
            userId,
            event: payload.eventType 
          });
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    logger.error('Failed to subscribe to user lead updates', { module: 'userLeadsApi' }, error);
    throw new ApiError('subscribeToUserLeadUpdates', error);
  }
}