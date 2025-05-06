
import { supabase } from '@/modules/auth/api/auth-api';
import { Lead, LeadFormValues, LeadStatus } from '../types/types';

// Create a new lead
export const createLead = async (leadData: LeadFormValues, userId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...leadData,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get leads with optional filters
export const getLeads = async (filters: { status?: LeadStatus; category?: string } = {}): Promise<Lead[]> => {
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
  
  if (error) throw error;
  return data || [];
};

// Get leads for a specific user
export const getUserLeads = async (userId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('created_by', userId);
  
  if (error) throw error;
  return data || [];
};

// Get leads for a specific company
export const getCompanyLeads = async (companyId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId);
  
  if (error) throw error;
  return data || [];
};

// Update lead status
export const updateLeadStatus = async (leadId: string, status: LeadStatus): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Assign lead to company
export const assignLeadToCompany = async (leadId: string, companyId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      company_id: companyId, 
      status: 'assigned', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get a specific lead by ID
export const getLeadById = async (leadId: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (error) throw error;
  return data;
};
