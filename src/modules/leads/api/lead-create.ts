
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadFormValues, LeadStatus, LEAD_STATUSES } from '@/types/leads';

// Create a new lead
export const createLead = async (leadData: LeadFormValues, userId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      title: leadData.title,
      description: leadData.description,
      category: leadData.category,
      status: leadData.status || 'new',
      customer_name: leadData.customer_name || '',
      customer_email: leadData.customer_email || '',
      customer_phone: leadData.customer_phone || '',
      service_type: leadData.service_type || '',
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
  const leadStatus = (lead.status || 'new') as LeadStatus;
  
  if (lead.status && !LEAD_STATUSES.includes(lead.status as LeadStatus)) {
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
        title: lead.title || 'Untitled Lead',
        description: lead.description || '',
        category: lead.category || 'general',
        status: leadStatus,
        customer_name: lead.customer_name || '',
        customer_email: lead.customer_email || '',
        customer_phone: lead.customer_phone || '',
        service_type: lead.service_type || '',
        company_id: lead.company_id,
        submitted_by: currentUserId, // Always use the current authenticated user's ID
        created_at: new Date().toISOString(),
        ...(lead.priority && { priority: lead.priority }),
        ...(lead.content && { content: lead.content }),
        ...(lead.lead_type && { lead_type: lead.lead_type }),
        ...(lead.metadata && { metadata: lead.metadata }),
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}
