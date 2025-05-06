import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadFormValues, LeadStatus, LEAD_STATUSES } from '../types/types';
import { isStatusTransitionAllowed } from '../utils/lead-utils';

// Create a new lead
export const createLead = async (leadData: LeadFormValues, userId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...leadData,
      submitted_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
};

/**
 * Insert a new lead into Supabase with improved field handling and status validation
 */
export async function insertLead(lead: Partial<Lead>) {
  // Validate the status if provided
  if (lead.status && !LEAD_STATUSES.includes(lead.status)) {
    throw new Error(`Invalid status: ${lead.status}. Must be one of: ${LEAD_STATUSES.join(', ')}`);
  }

  // Ensure the lead is being submitted by the authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required: You must be logged in to submit a lead');
  }

  const currentUserId = session.user.id;
  
  // If submitted_by is provided, ensure it matches the current user
  if (lead.submitted_by && lead.submitted_by !== currentUserId) {
    throw new Error('Unauthorized: You can only submit leads under your own user ID');
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        title: lead.title,
        description: lead.description,
        category: lead.category,
        status: lead.status ?? 'new',
        company_id: lead.company_id,
        submitted_by: currentUserId, // Always use the current authenticated user's ID
        created_at: new Date().toISOString(),
        ...(lead.priority && { priority: lead.priority }),
        ...(lead.content && { content: lead.content }),
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

// Get leads with optional filters
export const getLeads = async (filters: { status?: LeadStatus; category?: string } = {}): Promise<Lead[]> => {
  let query = supabase
    .from('leads')
    .select('*');
  
  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as Lead[] || [];
};

// Get leads for a specific user
export const getUserLeads = async (userId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('submitted_by', userId);
  
  if (error) throw error;
  return data as Lead[] || [];
};

// Get leads for a specific company
export const getCompanyLeads = async (companyId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId);
  
  if (error) throw error;
  return data as Lead[] || [];
};

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

  // If transition is allowed, update the status
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status: newStatus, 
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
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      company_id: companyId, 
      status: 'assigned', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Lead;
};

// Get a specific lead by ID
export const getLeadById = async (leadId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (error) throw error;
  return data as Lead;
};
