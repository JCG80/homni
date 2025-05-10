
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/leads';
import { parseLead } from '../utils/parseLead';

export const listLeads = async (): Promise<Lead[]> => {
  try {
    // Use a simple select with explicit typing and avoid template literals
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
    
    // Use parseLead on each item individually to avoid deep type inferencing
    const leads = (data || []).map(item => parseLead(item));
    return leads;
  } catch (error) {
    console.error('Unexpected error listing leads:', error);
    return [];
  }
};

export const listLeadsByCompany = async (companyId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_company_id', companyId);
    
    if (error) {
      console.error(`Error fetching leads for company ${companyId}:`, error);
      return [];
    }
    
    return (data || []).map(item => parseLead(item));
  } catch (error) {
    console.error(`Unexpected error listing leads for company ${companyId}:`, error);
    return [];
  }
};

export const listLeadsByUser = async (userId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('created_by', userId);
    
    if (error) {
      console.error(`Error fetching leads for user ${userId}:`, error);
      return [];
    }
    
    return (data || []).map(item => parseLead(item));
  } catch (error) {
    console.error(`Unexpected error listing leads for user ${userId}:`, error);
    return [];
  }
};

// Helper function to retry API calls
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`API call failed, attempt ${attempt + 1}/${maxRetries}:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }
  
  throw lastError;
};

// Export these functions to match the imports in useLeads.ts
export const getLeads = listLeads;
export const getUserLeads = listLeadsByUser;
export const getCompanyLeads = listLeadsByCompany;
export const getLeadById = async (leadId: string): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (error) {
      console.error(`Error fetching lead ${leadId}:`, error);
      return null;
    }
    
    return data ? parseLead(data) : null;
  } catch (error) {
    console.error(`Unexpected error fetching lead ${leadId}:`, error);
    return null;
  }
};
