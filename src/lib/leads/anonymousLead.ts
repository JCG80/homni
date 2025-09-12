import { supabase } from '@/lib/supabaseClient';
import { eventBus } from '@/lib/events/EventBus';
import { logger } from '@/utils/logger';

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
    logger.error('Duplicate check error:', {
      module: 'anonymousLead',
      email,
      category
    }, error);
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
      logger.error('Error creating lead:', {
        module: 'anonymousLead',
        title: leadData.title,
        category: leadData.category
      }, createError || new Error('No lead returned'));
      throw new Error('Kunne ikke opprette forespørsel. Vennligst prøv igjen.');
    }

    // Emit lead.created event
    eventBus.emit('lead.created', {
      leadId: lead.id,
      source: 'anonymous',
      category: leadData.category,
      userId: null,
      timestamp: new Date().toISOString()
    });

    // Try to distribute the lead using the enhanced budget-aware function
    const { data: distributionResult, error: distributionError } = await supabase.rpc(
      'distribute_new_lead_v3',
      { lead_id_param: lead.id }
    );

    if (distributionError) {
      logger.error('Error distributing lead:', {
        module: 'anonymousLead',
        leadId: lead.id,
        category: leadData.category
      }, distributionError);
      // Lead created but not distributed - still return success
    }
    
    // Check if distribution was successful
    const result = distributionResult?.[0];
    const distributed = result?.success === true;

    // Emit lead.assigned if distribution succeeded
    if (distributed && result?.company_id) {
      eventBus.emit('lead.assigned', {
        leadId: lead.id,
        companyId: result.company_id,
        cost: result?.assignment_cost || 0,
        timestamp: new Date().toISOString()
      });
    }
    
    return { 
      id: lead.id,
      distributed,
      assignedTo: result?.company_id,
      cost: result?.assignment_cost || 0
    };
  } catch (error) {
    logger.error('Error in createAnonymousLead:', {
      module: 'anonymousLead',
      title: leadData.title,
      category: leadData.category
    }, error as Error);
    throw error;
  }
};