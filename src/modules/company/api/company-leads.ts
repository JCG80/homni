import { supabase } from '@/lib/supabaseClient';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import type { LeadStatus } from '@/types/leads-canonical';

/**
 * Company Lead Management API - Lead reception and pipeline management
 */

export interface LeadAssignment {
  id: string;
  lead_id: string;
  buyer_id: string;
  assigned_at: string;
  cost: number;
  status: 'assigned' | 'accepted' | 'rejected' | 'completed';
  pipeline_stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  expires_at?: string;
  accepted_at?: string;
  completed_at?: string;
  rejection_reason?: string;
  buyer_notes?: string;
}

export interface CompanyLead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  assignment?: LeadAssignment;
}

export interface PipelineUpdate {
  leadId: string;
  stage: string;
  status?: LeadStatus;
  notes?: string;
}

/**
 * Fetch leads assigned to company
 */
export async function fetchCompanyLeads(companyId: string, filters?: {
  status?: LeadStatus[];
  stage?: string[];
  limit?: number;
}): Promise<CompanyLead[]> {
  try {
    logger.info('Fetching company leads', { module: 'companyLeadsApi', companyId, filters });

    let query = supabase
      .from('leads')
      .select(`
        *,
        lead_assignments!inner(
          id,
          assigned_at,
          cost,
          status,
          pipeline_stage,
          expires_at,
          accepted_at,
          completed_at,
          rejection_reason,
          buyer_notes
        )
      `)
      .eq('lead_assignments.buyer_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.stage?.length) {
      query = query.in('lead_assignments.pipeline_stage', filters.stage);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError('fetchCompanyLeads', error);
    }

    // Transform data to include assignment info
    const transformedData = (data || []).map(lead => ({
      ...lead,
      assignment: Array.isArray(lead.lead_assignments) 
        ? lead.lead_assignments[0] 
        : lead.lead_assignments
    }));

    return dedupeByKey(transformedData, 'id');
  } catch (error) {
    logger.error('Failed to fetch company leads', { module: 'companyLeadsApi' }, error);
    throw new ApiError('fetchCompanyLeads', error);
  }
}

/**
 * Update lead status and pipeline stage
 */
export async function updateLeadPipeline(update: PipelineUpdate): Promise<boolean> {
  try {
    logger.info('Updating lead pipeline', { module: 'companyLeadsApi', update });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    // Update lead status if provided
    if (update.status) {
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          status: update.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.leadId);

      if (leadError) {
        throw new ApiError('updateLeadStatus', leadError);
      }
    }

    // Update assignment pipeline stage
    const { error: assignmentError } = await supabase
      .from('lead_assignments')
      .update({
        pipeline_stage: update.stage,
        buyer_notes: update.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('lead_id', update.leadId);

    if (assignmentError) {
      throw new ApiError('updateLeadPipeline', assignmentError);
    }

    toast({
      title: "Lead oppdatert",
      description: "Lead-status og pipeline er oppdatert",
    });

    return true;
  } catch (error) {
    logger.error('Failed to update lead pipeline', { module: 'companyLeadsApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere lead",
      variant: "destructive",
    });
    throw new ApiError('updateLeadPipeline', error);
  }
}

/**
 * Accept or reject lead assignment
 */
export async function respondToLeadAssignment(
  assignmentId: string, 
  response: 'accept' | 'reject',
  rejectionReason?: string
): Promise<boolean> {
  try {
    logger.info('Responding to lead assignment', { 
      module: 'companyLeadsApi', 
      assignmentId, 
      response 
    });

    const updateData: any = {
      status: response === 'accept' ? 'accepted' : 'rejected',
      updated_at: new Date().toISOString(),
    };

    if (response === 'accept') {
      updateData.accepted_at = new Date().toISOString();
    } else {
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from('lead_assignments')
      .update(updateData)
      .eq('id', assignmentId);

    if (error) {
      throw new ApiError('respondToLeadAssignment', error);
    }

    toast({
      title: response === 'accept' ? "Lead akseptert" : "Lead avvist",
      description: response === 'accept' 
        ? "Du har akseptert denne leaden" 
        : "Du har avvist denne leaden",
    });

    return true;
  } catch (error) {
    logger.error('Failed to respond to lead assignment', { module: 'companyLeadsApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke svare på lead-tildeling",
      variant: "destructive",
    });
    throw new ApiError('respondToLeadAssignment', error);
  }
}

/**
 * Fetch company pipeline statistics
 */
export async function fetchPipelineStats(companyId: string) {
  try {
    logger.info('Fetching pipeline statistics', { module: 'companyLeadsApi', companyId });

    const { data, error } = await supabase
      .rpc('get_company_pipeline_stats', { company_id_param: companyId });

    if (error) {
      throw new ApiError('fetchPipelineStats', error);
    }

    return data;
  } catch (error) {
    logger.error('Failed to fetch pipeline stats', { module: 'companyLeadsApi' }, error);
    throw new ApiError('fetchPipelineStats', error);
  }
}

/**
 * Mark lead assignment as completed
 */
export async function completeLeadAssignment(assignmentId: string): Promise<boolean> {
  try {
    logger.info('Completing lead assignment', { module: 'companyLeadsApi', assignmentId });

    const { error } = await supabase
      .from('lead_assignments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        pipeline_stage: 'closed_won',
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId);

    if (error) {
      throw new ApiError('completeLeadAssignment', error);
    }

    toast({
      title: "Lead fullført",
      description: "Lead-oppdraget er markert som fullført",
    });

    return true;
  } catch (error) {
    logger.error('Failed to complete lead assignment', { module: 'companyLeadsApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke fullføre lead-oppdraget",
      variant: "destructive",
    });
    throw new ApiError('completeLeadAssignment', error);
  }
}