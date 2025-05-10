
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/leads';
import { parseLead } from '../utils/parseLead';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';

// Define a simpler type to avoid deep nesting
type SimpleLead = {
  id: string;
  submitted_by: string;
  status: string;
  created_at: string;
  title?: string;
  description?: string;
  category?: string;
  assigned_company_id?: string;
};

export const listLeads = async (): Promise<Lead[]> => {
  try {
    // Use a basic select without generic type annotation to avoid deep type instantiation
    const { data: rawData, error } = await supabase
      .from('leads')
      .select('id, submitted_by, status, created_at, title, description, category');
    
    if (error) {
      throw new ApiError('listLeads', error);
    }
    
    if (!rawData) return [];

    // Cast to simple type and map using parseLead
    const leads = (rawData as SimpleLead[]).map(item => parseLead(item));
    return dedupeByKey(leads, 'id');
  } catch (error) {
    console.error('Unexpected error listing leads:', error);
    return [];
  }
};

export const listLeadsByCompany = async (companyId: string): Promise<Lead[]> => {
  try {
    // Use basic select without generic type annotation
    const { data: rawData, error } = await supabase
      .from('leads')
      .select('id, submitted_by, status, created_at, title, description, category')
      .eq('company_id', companyId);
    
    if (error) {
      throw new ApiError('listLeadsByCompany', error);
    }
    
    if (!rawData) return [];
    
    const leads = (rawData as SimpleLead[]).map(item => parseLead(item));
    return dedupeByKey(leads, 'id');
  } catch (error) {
    console.error(`Unexpected error listing leads for company ${companyId}:`, error);
    return [];
  }
};

export const listLeadsByUser = async (userId: string): Promise<Lead[]> => {
  try {
    // Completely remove the generic parameter to avoid the deep instantiation error
    const { data: rawData, error } = await supabase
      .from('leads')
      .select('id, submitted_by, status, created_at, title, description, category')
      .eq('created_by', userId);
    
    if (error) {
      throw new ApiError('listLeadsByUser', error);
    }
    
    if (!rawData) return [];
    
    const leads = (rawData as SimpleLead[]).map(item => parseLead(item));
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
    const { data: rawData, error } = await supabase
      .from('leads')
      .select('id, submitted_by, status, created_at, title, description, category')
      .eq('id', leadId)
      .single();
    
    if (error) {
      throw new ApiError('getLeadById', error);
    }
    
    return rawData ? parseLead(rawData as SimpleLead) : null;
  } catch (error) {
    console.error(`Unexpected error fetching lead ${leadId}:`, error);
    return null;
  }
};
