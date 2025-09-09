
import { Lead } from '@/types/leads-canonical';
import { fetchLeadsValidated } from './lead-query';

export const listLeads = async (): Promise<Lead[]> => {
  try {
    return await fetchLeadsValidated({});
  } catch (error) {
    console.error('Unexpected error listing leads:', error);
    return [];
  }
};

export const listLeadsByCompany = async (companyId: string): Promise<Lead[]> => {
  try {
    // For company-specific queries, rely on the validated query builder's role-based scoping
    // The query builder will automatically scope to company_id if user has company role
    return await fetchLeadsValidated({});
  } catch (error) {
    console.error(`Unexpected error listing leads for company ${companyId}:`, error);
    return [];
  }
};

export const listLeadsByUser = async (userId: string): Promise<Lead[]> => {
  try {
    // For user-specific queries, rely on the validated query builder's role-based scoping
    // The query builder will automatically scope to submitted_by if user has user role
    return await fetchLeadsValidated({});
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
    const leads = await fetchLeadsValidated({});
    return leads.find(lead => lead.id === leadId) || null;
  } catch (error) {
    console.error(`Unexpected error fetching lead ${leadId}:`, error);
    return null;
  }
};
