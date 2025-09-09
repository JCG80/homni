
import { supabase } from '@/integrations/supabase/client';
import { Lead, normalizeStatus, statusToPipeline } from '@/types/leads-canonical';

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

    // Safely extract metadata
    const metadata = typeof data.metadata === 'object' && data.metadata !== null 
      ? data.metadata as Record<string, unknown>
      : {};

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
      customer_name: metadata.customer_name as string || null,
      customer_email: metadata.customer_email as string || null,
      customer_phone: metadata.customer_phone as string || null,
      service_type: metadata.service_type as string || null,
      submitted_by: data.submitted_by,
      company_id: data.company_id,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
      metadata
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
