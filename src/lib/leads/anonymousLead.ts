import { supabase } from '@/lib/supabaseClient';

interface AnonymousLeadData {
  title: string;
  description: string;
  category: string;
  metadata: Record<string, any>;
}

export const createAnonymousLead = async (leadData: AnonymousLeadData) => {
  try {
    // Extract email from metadata for lead attribution
    const anonymousEmail = leadData.metadata?.email || null;
    
    // First create the lead without submitted_by since it's for guest users
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        title: leadData.title,
        description: leadData.description,
        category: leadData.category,
        metadata: leadData.metadata as any,
        anonymous_email: anonymousEmail, // Store email for later attribution
        session_id: Math.random().toString(36).substring(7), // Simple session tracking
        lead_type: 'visitor',
        submitted_by: null as unknown as string
      })
      .select('id')
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      throw new Error('Failed to create lead');
    }

    // Call the distribution function to match with packages and buyers
    const { error: distributeError } = await supabase.rpc('distribute_new_lead', {
      lead_id_param: lead.id
    });

    if (distributeError) {
      console.warn('Lead created but distribution failed:', distributeError);
      // Don't throw here as the lead is still created successfully
    }

    return lead;
  } catch (error) {
    console.error('Error in createAnonymousLead:', error);
    throw error;
  }
};