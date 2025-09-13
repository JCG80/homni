import { supabase } from '@/lib/supabaseClient';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import type { LeadStatus } from '@/types/leads-canonical';

/**
 * Lead Status API - Status tracking, updates, and history
 */

export interface LeadStatusUpdate {
  leadId: string;
  status: LeadStatus;
  notes?: string;
  updatedBy: string;
}

export interface LeadHistory {
  id: string;
  lead_id: string;
  assigned_to?: string;
  method: string;
  previous_status: string;
  new_status: string;
  metadata?: any;
  created_at: string;
}

export interface LeadTrackingInfo {
  id: string;
  title: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  company_name?: string;
  assignment_status?: string;
  pipeline_stage?: string;
  last_contact?: string;
  estimated_completion?: string;
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  notes?: string
): Promise<boolean> {
  try {
    logger.info('Updating lead status', { 
      module: 'leadStatusApi', 
      leadId, 
      newStatus 
    });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    // Get current status for history tracking
    const { data: currentLead, error: fetchError } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();

    if (fetchError) {
      throw new ApiError('fetchCurrentStatus', fetchError);
    }

    // Update lead status
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (updateError) {
      throw new ApiError('updateLeadStatus', updateError);
    }

    // Add to history
    const { error: historyError } = await supabase
      .from('lead_history')
      .insert({
        lead_id: leadId,
        method: 'manual_update',
        previous_status: currentLead.status,
        new_status: newStatus,
        metadata: {
          updated_by: user.user.id,
          notes: notes,
          timestamp: new Date().toISOString(),
        },
      });

    if (historyError) {
      logger.warn('Failed to add lead history', { module: 'leadStatusApi' }, historyError);
    }

    toast({
      title: "Status oppdatert",
      description: `Lead-status endret til ${newStatus}`,
    });

    return true;
  } catch (error) {
    logger.error('Failed to update lead status', { module: 'leadStatusApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere lead-status",
      variant: "destructive",
    });
    throw new ApiError('updateLeadStatus', error);
  }
}

/**
 * Get lead history
 */
export async function fetchLeadHistory(leadId: string): Promise<LeadHistory[]> {
  try {
    logger.info('Fetching lead history', { module: 'leadStatusApi', leadId });

    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError('fetchLeadHistory', error);
    }

    return dedupeByKey(data || [], 'id');
  } catch (error) {
    logger.error('Failed to fetch lead history', { module: 'leadStatusApi' }, error);
    throw new ApiError('fetchLeadHistory', error);
  }
}

/**
 * Get user's leads with tracking information
 */
export async function fetchUserLeadsTracking(userId: string): Promise<LeadTrackingInfo[]> {
  try {
    logger.info('Fetching user leads tracking', { module: 'leadStatusApi', userId });

    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        company_profiles:company_id (
          name
        ),
        lead_assignments (
          status,
          pipeline_stage,
          assigned_at,
          expires_at
        )
      `)
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError('fetchUserLeadsTracking', error);
    }

    // Transform data for tracking view
    const trackingData = (data || []).map(lead => ({
      id: lead.id,
      title: lead.title,
      status: lead.status,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      company_name: lead.company_profiles?.name,
      assignment_status: Array.isArray(lead.lead_assignments) 
        ? lead.lead_assignments[0]?.status 
        : lead.lead_assignments?.status,
      pipeline_stage: Array.isArray(lead.lead_assignments)
        ? lead.lead_assignments[0]?.pipeline_stage
        : lead.lead_assignments?.pipeline_stage,
      last_contact: Array.isArray(lead.lead_assignments)
        ? lead.lead_assignments[0]?.assigned_at
        : lead.lead_assignments?.assigned_at,
      estimated_completion: Array.isArray(lead.lead_assignments)
        ? lead.lead_assignments[0]?.expires_at
        : lead.lead_assignments?.expires_at,
    }));

    return dedupeByKey(trackingData, 'id');
  } catch (error) {
    logger.error('Failed to fetch user leads tracking', { module: 'leadStatusApi' }, error);
    throw new ApiError('fetchUserLeadsTracking', error);
  }
}

/**
 * Get lead status statistics
 */
export async function fetchLeadStatusStats(userId?: string) {
  try {
    logger.info('Fetching lead status statistics', { module: 'leadStatusApi', userId });

    let query = supabase
      .from('leads')
      .select('status, created_at');

    if (userId) {
      query = query.eq('submitted_by', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError('fetchLeadStatusStats', error);
    }

    // Calculate statistics
    const stats = {
      total: data.length,
      by_status: {} as Record<string, number>,
      recent_activity: 0,
    };

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    data.forEach(lead => {
      stats.by_status[lead.status] = (stats.by_status[lead.status] || 0) + 1;
      
      if (new Date(lead.created_at) > last24Hours) {
        stats.recent_activity++;
      }
    });

    return stats;
  } catch (error) {
    logger.error('Failed to fetch lead status stats', { module: 'leadStatusApi' }, error);
    throw new ApiError('fetchLeadStatusStats', error);
  }
}

/**
 * Check lead status changes in real-time
 */
export async function subscribeToLeadStatusChanges(
  leadId: string,
  callback: (payload: any) => void
) {
  try {
    logger.info('Subscribing to lead status changes', { module: 'leadStatusApi', leadId });

    const channel = supabase
      .channel(`lead_status_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`,
        },
        (payload) => {
          logger.info('Lead status change detected', { 
            module: 'leadStatusApi', 
            leadId, 
            payload 
          });
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    logger.error('Failed to subscribe to lead status changes', { module: 'leadStatusApi' }, error);
    throw new ApiError('subscribeToLeadStatusChanges', error);
  }
}

/**
 * Bulk update multiple lead statuses
 */
export async function bulkUpdateLeadStatuses(
  updates: LeadStatusUpdate[]
): Promise<{ successful: number; failed: number }> {
  try {
    logger.info('Bulk updating lead statuses', { 
      module: 'leadStatusApi', 
      count: updates.length 
    });

    let successful = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        await updateLeadStatus(update.leadId, update.status, update.notes);
        successful++;
      } catch (error) {
        logger.warn('Failed to update individual lead status', { 
          module: 'leadStatusApi',
          leadId: update.leadId 
        }, error);
        failed++;
      }
    }

    toast({
      title: "Bulk oppdatering fullført",
      description: `${successful} oppdateringer vellykket, ${failed} feilet`,
      variant: failed > 0 ? "destructive" : "default",
    });

    return { successful, failed };
  } catch (error) {
    logger.error('Failed to bulk update lead statuses', { module: 'leadStatusApi' }, error);
    throw new ApiError('bulkUpdateLeadStatuses', error);
  }
}