import { supabase } from '@/lib/supabaseClient';

interface AnonymousLeadData {
  title: string;
  description: string;
  category: string;
  metadata: Record<string, any>;
}

// Check for recent duplicate leads by email and category 
const checkDuplicate = async (email: string, category: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .eq('anonymous_email', email.toLowerCase())
    .eq('category', category)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
    .limit(1);
    
  if (error) {
    console.error('Duplicate check error:', error);
    return false; // Allow creation if check fails
  }
  
  return (data && data.length > 0);
};

export const createAnonymousLead = async (leadData: AnonymousLeadData) => {
  try {
    // Extract email from metadata for lead attribution
    const anonymousEmail = leadData.metadata?.email || null;
    const sessionId = Math.random().toString(36).substring(7);
    
    // Check for duplicates if email is provided
    if (anonymousEmail) {
      const isDuplicate = await checkDuplicate(anonymousEmail, leadData.category);
      if (isDuplicate) {
        throw new Error('Du har allerede sendt en forespørsel for denne kategorien i dag. Vennligst prøv igjen i morgen.');
      }
    }
    
    // Create the lead first
    const { data: lead, error: createError } = await supabase
      .from('leads')
      .insert({
        title: leadData.title,
        description: leadData.description,
        category: leadData.category,
        metadata: leadData.metadata,
        anonymous_email: anonymousEmail,
        session_id: sessionId,
        lead_type: 'visitor',
        status: 'new'
      })
      .select('id')
      .single();

    if (createError || !lead) {
      console.error('Error creating lead:', createError);
      throw new Error('Kunne ikke opprette forespørsel. Vennligst prøv igjen.');
    }

    // Try to distribute the lead using the new function
    const { data: distributionResult, error: distributionError } = await supabase.rpc(
      'distribute_new_lead_v2',
      { lead_id_param: lead.id }
    );

    if (distributionError) {
      console.error('Error distributing lead:', distributionError);
      // Lead created but not distributed - still return success
    }
    
    return { 
      id: lead.id,
      distributed: !distributionError && distributionResult?.length > 0,
      assignedTo: distributionResult?.[0]?.company_id 
    };
  } catch (error) {
    console.error('Error in createAnonymousLead:', error);
    throw error;
  }
};