
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadFormValues, LeadStatus, LEAD_STATUSES, isValidLeadStatus } from '@/types/leads';
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
  console.log('Fetching all leads with filters:', filters);
  
  try {
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
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leads`);
    return data as Lead[] || [];
  } catch (error) {
    console.error('Exception in getLeads:', error);
    throw error;
  }
};

// Get leads for a specific user
export const getUserLeads = async (userId: string): Promise<Lead[]> => {
  console.log('Fetching leads for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('submitted_by', userId);
    
    if (error) {
      console.error('Error fetching user leads:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leads for user ${userId}`);
    return data as Lead[] || [];
  } catch (error) {
    console.error('Exception in getUserLeads:', error);
    throw error;
  }
};

// Get leads for a specific company
export const getCompanyLeads = async (companyId: string): Promise<Lead[]> => {
  console.log('Fetching leads for company:', companyId);
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) {
      console.error('Error fetching company leads:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leads for company ${companyId}`);
    return data as Lead[] || [];
  } catch (error) {
    console.error('Exception in getCompanyLeads:', error);
    throw error;
  }
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
