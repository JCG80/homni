
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/leads';
import { parseLead } from '../utils/parseLead';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';

// Define specific fields to select to avoid type recursion issues
const LEAD_FIELDS = 'id, submitted_by, status, created_at, title, description, category, company_id';

export const listLeads = async (): Promise<Lead[]> => {
  try {
    // Avoid generic type parameters completely
    const { data: rawData, error } = await supabase
      .from('leads')
      .select(LEAD_FIELDS);
    
    if (error) {
      throw new ApiError('listLeads', error);
    }
    
    if (!rawData) return [];

    // Map using parseLead without casting to intermediate type
    const leads = rawData.map(item => parseLead(item));
    return dedupeByKey(leads, 'id');
  } catch (error) {
    console.error('Unexpected error listing leads:', error);
    return [];
  }
};

export const listLeadsByCompany = async (companyId: string): Promise<Lead[]> => {
  try {
    // Avoid generic type parameters completely
    const { data: rawData, error } = await supabase
      .from('leads')
      .select(LEAD_FIELDS)
      .eq('company_id', companyId);
    
    if (error) {
      throw new ApiError('listLeadsByCompany', error);
    }
    
    if (!rawData) return [];
    
    // Map directly without intermediate type
    const leads = rawData.map(item => parseLead(item));
    return dedupeByKey(leads, 'id');
  } catch (error) {
    console.error(`Unexpected error listing leads for company ${companyId}:`, error);
    return [];
  }
};

export const listLeadsByUser = async (userId: string): Promise<Lead[]> => {
  try {
    // Use raw query approach to completely avoid TypeScript recursion
    const { data: rawData, error } = await supabase
      .from('leads')
      .select(LEAD_FIELDS)
      .eq('submitted_by', userId);
    
    if (error) {
      throw new ApiError('listLeadsByUser', error);
    }
    
    if (!rawData) return [];
    
    // Map directly without intermediate type
    const leads = rawData.map(item => parseLead(item));
    return dedupeByKey(leads, 'id');
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
    // Avoid generic type parameters completely
    const { data: rawData, error } = await supabase
      .from('leads')
      .select(LEAD_FIELDS)
      .eq('id', leadId)
      .single();
    
    if (error) {
      throw new ApiError('getLeadById', error);
    }
    
    return rawData ? parseLead(rawData) : null;
  } catch (error) {
    console.error(`Unexpected error fetching lead ${leadId}:`, error);
    return null;
  }
};
