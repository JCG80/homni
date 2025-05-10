
// ⚡️ FIX: Resolved TS2589 by simplifying select and using parseLead correctly
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadFilter } from '@/types/leads';
import { parseLead } from '../utils/parseLead';

/**
 * Get all leads with optional filters
 */
export async function getLeads(filters: LeadFilter = {}): Promise<Lead[]> {
  let query = supabase.from('leads').select('*');
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.zipCode) {
    query = query.eq('zipCode', filters.zipCode);
  }
  
  try {
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(item => parseLead(item));
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return [];
  }
}

/**
 * Get leads submitted by a specific user
 */
export async function getUserLeads(userId: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('submitted_by', userId);
    
    if (error) throw error;
    return (data || []).map(item => parseLead(item));
  } catch (error) {
    console.error(`Failed to fetch user leads for user ${userId}:`, error);
    return [];
  }
}

/**
 * Get leads assigned to a specific company
 */
export async function getCompanyLeads(companyId: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) throw error;
    return (data || []).map(item => parseLead(item));
  } catch (error) {
    console.error(`Failed to fetch company leads for company ${companyId}:`, error);
    return [];
  }
}

/**
 * Get a specific lead by ID
 */
export async function getLeadById(leadId: string): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    return parseLead(data);
  } catch (error) {
    console.error(`Failed to fetch lead with ID ${leadId}:`, error);
    return null;
  }
}

/**
 * Load leads with simplified selection
 */
export async function loadLeads(): Promise<Lead[]> {
  let retryCount = 0;
  const maxRetries = 3;
  
  const attemptLoad = async (): Promise<Lead[]> => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*');

      if (error) throw error;
      return (data || []).map(item => parseLead(item));
    } catch (error) {
      console.error('Failed to load leads:', error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying leads load (${retryCount}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return attemptLoad();
      }
      
      return [];
    }
  };
  
  return attemptLoad();
}
