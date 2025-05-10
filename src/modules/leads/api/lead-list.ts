
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
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data || []).map(item => parseLead(item));
}

/**
 * Get leads submitted by a specific user
 */
export async function getUserLeads(userId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('submitted_by', userId);
  
  if (error) throw error;
  return (data || []).map(item => parseLead(item));
}

/**
 * Get leads assigned to a specific company
 */
export async function getCompanyLeads(companyId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId);
  
  if (error) throw error;
  return (data || []).map(item => parseLead(item));
}

/**
 * Get a specific lead by ID
 */
export async function getLeadById(leadId: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (error) throw error;
  return parseLead(data);
}
