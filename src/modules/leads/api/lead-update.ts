
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/leads';
import { isStatusTransitionAllowed } from '../utils/lead-utils';
import { mapToEmojiStatus } from '@/types/leads';

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
  
  // Validate the status transition
  if (!isStatusTransitionAllowed(currentLead.status as LeadStatus, newStatus)) {
    throw new Error(
      `Invalid status transition: Cannot change from '${currentLead.status}' to '${newStatus}'`
    );
  }

  const dbStatus = mapToEmojiStatus(newStatus as string);

  // If transition is allowed, update the status
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status: dbStatus as any, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update lead status: ${error.message}`);
  return data as Lead;
};

// Assign lead to company
export const assignLeadToCompany = async (leadId: string, companyId: string): Promise<Lead> => {
  const assignedStatus = mapToEmojiStatus('assigned');
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      company_id: companyId, 
      status: assignedStatus as any, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Lead;
};
