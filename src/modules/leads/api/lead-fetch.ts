
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/leads';

// Get leads with optional filters
export const getLeads = async (filters: { status?: LeadStatus; category?: string } = {}): Promise<Lead[]> => {
  console.log('Fetching all leads with filters:', filters);
  
  try {
    let query = supabase
      .from('leads')
      .select('*');
    
    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leads`);
    return data as Lead[] || [];
  } catch (error) {
    console.error('Exception in getLeads:', error);
    throw error;
  }
};

// Get leads for a specific user
export const getUserLeads = async (userId: string): Promise<Lead[]> => {
  console.log('Fetching leads for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('submitted_by', userId);
    
    if (error) {
      console.error('Error fetching user leads:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leads for user ${userId}`);
    return data as Lead[] || [];
  } catch (error) {
    console.error('Exception in getUserLeads:', error);
    throw error;
  }
};

// Get leads for a specific company
export const getCompanyLeads = async (companyId: string): Promise<Lead[]> => {
  console.log('Fetching leads for company:', companyId);
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) {
      console.error('Error fetching company leads:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} leads for company ${companyId}`);
    return data as Lead[] || [];
  } catch (error) {
    console.error('Exception in getCompanyLeads:', error);
    throw error;
  }
};

// Get a specific lead by ID
export const getLeadById = async (leadId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (error) throw error;
  return data as Lead;
};
