import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * Lead Creation API - User lead submission and validation
 */

export interface LeadSubmissionData {
  title: string;
  description: string;
  category: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  metadata?: {
    location?: string;
    urgency?: 'low' | 'medium' | 'high';
    budget_range?: string;
    preferred_contact_method?: 'email' | 'phone' | 'sms';
    property_type?: string;
    service_details?: any;
  };
}

export interface LeadCreationResult {
  leadId: string;
  status: 'created' | 'distributed' | 'queued';
  assignedCompany?: string;
  message: string;
}

/**
 * Create new lead for authenticated user
 */
export async function createLead(leadData: LeadSubmissionData): Promise<LeadCreationResult> {
  try {
    logger.info('Creating new lead', { module: 'leadCreationApi', category: leadData.category });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User must be authenticated to create leads');
    }

    // Create the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        title: leadData.title,
        description: leadData.description,
        category: leadData.category,
        customer_name: leadData.customer_name,
        customer_email: leadData.customer_email,
        customer_phone: leadData.customer_phone,
        submitted_by: user.user.id,
        lead_type: 'user_submitted',
        status: 'new',
        metadata: leadData.metadata || {},
      })
      .select()
      .single();

    if (leadError) {
      throw new ApiError('createLead', leadError);
    }

    // Attempt automatic distribution
    let distributionResult = null;
    try {
      const { data, error: distError } = await supabase
        .rpc('distribute_new_lead_v3', { lead_id_param: lead.id });

      if (!distError && data?.length > 0 && data[0].success) {
        distributionResult = {
          assignedCompany: data[0].company_id,
          cost: data[0].assignment_cost,
        };
      }
    } catch (distError) {
      // Distribution failed, but lead was created successfully
      logger.warn('Lead distribution failed', { 
        module: 'leadCreationApi', 
        leadId: lead.id 
      }, distError);
    }

    const result: LeadCreationResult = {
      leadId: lead.id,
      status: distributionResult ? 'distributed' : 'queued',
      assignedCompany: distributionResult?.assignedCompany,
      message: distributionResult 
        ? 'Lead opprettet og tildelt et selskap' 
        : 'Lead opprettet og lagt i kø for tildeling',
    };

    toast({
      title: "Lead opprettet",
      description: result.message,
    });

    return result;
  } catch (error) {
    logger.error('Failed to create lead', { module: 'leadCreationApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke opprette lead. Prøv igjen senere.",
      variant: "destructive",
    });
    throw new ApiError('createLead', error);
  }
}

/**
 * Create anonymous lead (for non-authenticated users)
 */
export async function createAnonymousLead(
  leadData: LeadSubmissionData,
  anonymousEmail: string,
  sessionId?: string
): Promise<LeadCreationResult> {
  try {
    logger.info('Creating anonymous lead', { 
      module: 'leadCreationApi', 
      category: leadData.category,
      email: anonymousEmail 
    });

    const { data: lead, error } = await supabase
      .rpc('create_anonymous_lead_and_distribute', {
        p_title: leadData.title,
        p_description: leadData.description,
        p_category: leadData.category,
        p_metadata: {
          ...leadData.metadata,
          customer_name: leadData.customer_name,
          customer_phone: leadData.customer_phone,
        },
        p_anonymous_email: anonymousEmail,
        p_session_id: sessionId || '',
      });

    if (error) {
      throw new ApiError('createAnonymousLead', error);
    }

    toast({
      title: "Forespørsel sendt",
      description: "Vi har mottatt din forespørsel og vil kontakte deg snart.",
    });

    return {
      leadId: lead,
      status: 'created',
      message: 'Anonymous lead created successfully',
    };
  } catch (error) {
    logger.error('Failed to create anonymous lead', { module: 'leadCreationApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke sende forespørsel. Prøv igjen senere.",
      variant: "destructive",
    });
    throw new ApiError('createAnonymousLead', error);
  }
}

/**
 * Validate lead data before submission
 */
export function validateLeadData(leadData: LeadSubmissionData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!leadData.title?.trim()) {
    errors.push('Tittel er påkrevd');
  }

  if (!leadData.description?.trim()) {
    errors.push('Beskrivelse er påkrevd');
  }

  if (!leadData.category?.trim()) {
    errors.push('Kategori er påkrevd');
  }

  if (leadData.customer_email && !/\S+@\S+\.\S+/.test(leadData.customer_email)) {
    errors.push('Ugyldig e-postadresse');
  }

  if (leadData.title && leadData.title.length > 200) {
    errors.push('Tittel kan ikke være lengre enn 200 tegn');
  }

  if (leadData.description && leadData.description.length > 2000) {
    errors.push('Beskrivelse kan ikke være lengre enn 2000 tegn');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get available lead categories
 */
export async function fetchLeadCategories(): Promise<string[]> {
  try {
    logger.info('Fetching lead categories', { module: 'leadCreationApi' });

    const { data, error } = await supabase
      .from('leads')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      throw new ApiError('fetchLeadCategories', error);
    }

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories.sort();
  } catch (error) {
    logger.error('Failed to fetch lead categories', { module: 'leadCreationApi' }, error);
    // Return default categories if fetch fails
    return [
      'Elektro',
      'VVS',
      'Bygg og anlegg',
      'Maling',
      'Takarbeid',
      'Rørleggerarbeid',
      'Oppvarming',
      'Isolasjon',
      'Vinduer og dører',
      'Hagearbeid',
    ];
  }
}