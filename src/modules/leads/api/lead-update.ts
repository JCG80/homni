
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus, normalizeStatus, statusToPipeline } from '@/types/leads';
import { isStatusTransitionAllowed } from '../utils/lead-utils';

/**
 * Update lead status with transition validation
 * Only allows status changes that are permitted by the transition rules
 */
export const updateLeadStatus = async (leadId: string, newStatus: LeadStatus): Promise<Lead> => {
  // First, fetch the current lead to check current status
  const { data: currentLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (fetchError) throw new Error(`Failed to fetch lead: ${fetchError.message}`);
  if (!currentLead) throw new Error(`Lead with ID ${leadId} not found`);
  
  const currentStatus = normalizeStatus(currentLead.status);
  
  // Validate the status transition
  if (!isStatusTransitionAllowed(currentStatus, newStatus)) {
    throw new Error(
      `Invalid status transition: Cannot change from '${currentStatus}' to '${newStatus}'`
    );
  }

  // Map to emoji status for database (temporary until schema migration)
  const statusMap: Record<LeadStatus, string> = {
    new: '📥 new',
    qualified: '👀 qualified',
    contacted: '💬 contacted',
    negotiating: '📞 negotiating',
    converted: '✅ converted',
    lost: '❌ lost',
    paused: '⏸️ paused',
  };

  // If transition is allowed, update the status
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status: statusMap[newStatus] as any,
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update lead status: ${error.message}`);
  
  // Transform the response to match our Lead interface
  const normalizedStatus = normalizeStatus(data.status);
  return {
    ...data,
    status: normalizedStatus,
    pipeline_stage: statusToPipeline(normalizedStatus),
    submitted_by: data.submitted_by || null,
    company_id: data.company_id || null,
  } as Lead;
};

// Assign lead to company
export const assignLeadToCompany = async (leadId: string, companyId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      company_id: companyId, 
      status: '👀 qualified' as any, // Use emoji status for database
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Transform the response to match our Lead interface
  const normalizedStatus = normalizeStatus(data.status);
  return {
    ...data,
    status: normalizedStatus,
    pipeline_stage: statusToPipeline(normalizedStatus),
    submitted_by: data.submitted_by || null,
    company_id: data.company_id || null,
  } as Lead;
};
