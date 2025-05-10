
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/leads';

/**
 * Fetch a lead by ID
 * @param leadId The ID of the lead to fetch
 * @returns The lead data, error, and status code
 */
export async function fetchLeadStatus(leadId: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, status, title, category, created_at')
      .eq('id', leadId)
      .single();
    
    return {
      data: data as Lead | null,
      error,
      status: error ? 404 : 200
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
