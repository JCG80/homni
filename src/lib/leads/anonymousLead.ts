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
    const sessionId = Math.random().toString(36).substring(7);
    
    // Use the RPC function to create and distribute the lead
    const { data: leadId, error: rpcError } = await supabase.rpc(
      'create_anonymous_lead_and_distribute',
      {
        p_title: leadData.title,
        p_description: leadData.description,
        p_category: leadData.category,
        p_metadata: leadData.metadata as any,
        p_anonymous_email: anonymousEmail,
        p_session_id: sessionId
      }
    );

    if (rpcError) {
      console.error('Error creating anonymous lead:', rpcError);
      
      // Provide user-friendly Norwegian error messages
      if (rpcError.code === '42501' || rpcError.message?.includes('permission denied')) {
        throw new Error('Tilgang nektet. Vennligst prøv igjen.');
      }
      
      throw new Error('Kunne ikke opprette forespørsel. Vennligst prøv igjen.');
    }

    if (!leadId) {
      throw new Error('Ingen ID returnert fra server. Vennligst prøv igjen.');
    }

    return { id: leadId };
  } catch (error) {
    console.error('Error in createAnonymousLead:', error);
    throw error;
  }
};