
import { supabase } from '@/integrations/supabase/client';
import { Lead, normalizeStatus, statusToPipeline } from '@/types/leads';

/**
 * Fetch a lead by ID
 * @param leadId The ID of the lead to fetch
 * @returns The lead data, error, and status code
 */
export async function fetchLeadStatus(leadId: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (error) {
      return {
        data: null,
        error,
        status: 404
      };
    }

    // Transform the raw data to match Lead interface
    const normalizedStatus = normalizeStatus(data.status);
    const transformedLead: Lead = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      lead_type: data.lead_type || '',
      status: normalizedStatus,
      pipeline_stage: statusToPipeline(normalizedStatus),
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      service_type: data.service_type,
      submitted_by: data.submitted_by,
      company_id: data.company_id,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
      metadata: data.metadata
    };
    
    return {
      data: transformedLead,
      error: null,
      status: 200
    };
  } catch (err) {
    console.error('Error fetching lead status:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error occurred'),
      status: 500
    };
  }
}
