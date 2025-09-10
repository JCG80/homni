import { supabase } from '@/lib/supabaseClient';

export interface SmartStartSubmissionData {
  session_id: string;
  postcode: string;
  requested_services: string[];
  is_company?: boolean;
  search_query?: string;
  selected_category?: string;
  flow_data?: Record<string, any>;
  step_completed: number;
  email?: string;
}

export interface SmartStartSubmission {
  id: string;
  user_id?: string;
  session_id?: string;
  email?: string;
  postcode: string;
  property_type?: string;
  requested_services: string[];
  is_company: boolean;
  source: string;
  step_completed: number;
  search_query?: string;
  selected_category?: string;
  flow_data?: Record<string, any>;
  lead_created?: boolean;
  lead_id?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create or update a SmartStart submission
 */
export const createSmartStartSubmission = async (
  data: SmartStartSubmissionData
): Promise<{ data: string | null; error: any }> => {
  try {
    const { data: submissionId, error } = await supabase
      .rpc('create_smart_start_submission', {
        p_session_id: data.session_id,
        p_postcode: data.postcode,
        p_requested_services: data.requested_services,
        p_is_company: data.is_company || false,
        p_search_query: data.search_query || null,
        p_selected_category: data.selected_category || null,
        p_flow_data: data.flow_data || {},
        p_step_completed: data.step_completed,
        p_email: data.email || null
      });

    if (error) throw error;

    return { data: submissionId, error: null };
  } catch (error) {
    console.error('Error creating SmartStart submission:', error);
    return { data: null, error };
  }
};

/**
 * Get user's SmartStart submissions
 */
export const getUserSubmissions = async (): Promise<{
  data: SmartStartSubmission[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('smart_start_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data as SmartStartSubmission[] | null, error };
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return { data: null, error };
  }
};

/**
 * Update submission with additional step data
 */
export const updateSubmissionStep = async (
  submissionId: string,
  stepData: Partial<SmartStartSubmissionData>
): Promise<{ data: any; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('smart_start_submissions')
      .update({
        ...stepData,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating submission step:', error);
    return { data: null, error };
  }
};