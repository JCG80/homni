import { supabase } from '@/integrations/supabase/client';
import { LeadCounts, Lead, LeadStatus, normalizeLeadStatus } from '@/types/leads-canonical';
import { fetchLeadsValidated } from './lead-query';

export async function fetchLeadsForKanban(companyId?: string, userId?: string): Promise<Lead[]> {
  try {
    // Use the validated query builder which handles role-based scoping automatically
    // Parameters are ignored as the query builder handles user context internally
    return await fetchLeadsValidated({});
  } catch (error) {
    console.error('Error fetching leads for kanban:', error);
    throw error;
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<boolean> {
  const { error } = await supabase
    .from('leads')
    .update({ 
      status: status,
      updated_at: new Date().toISOString() 
    })
    .eq('id', leadId);

  if (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }

  return true;
}

export async function fetchLeadCounts(companyId?: string, userId?: string): Promise<LeadCounts> {
  const counts: LeadCounts = {
    new: 0,
    qualified: 0,
    contacted: 0,
    negotiating: 0,
    converted: 0,
    lost: 0,
    paused: 0,
    in_progress: 0,
    won: 0
  };

  try {
    // Use the validated query builder which handles role-based scoping automatically
    // Parameters are ignored as the query builder handles user context internally
    const leads = await fetchLeadsValidated({});
    
    leads.forEach((lead) => {
      const normalizedStatus = normalizeLeadStatus(lead.status);
      switch (normalizedStatus) {
        case 'new':
          counts.new++;
          break;
        case 'qualified':
        case 'contacted':
        case 'negotiating':
        case 'paused':
          counts.in_progress++;
          break;
        case 'converted':
          counts.won++;
          break;
        case 'lost':
          counts.lost++;
          break;
        default:
          break;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error fetching lead counts:', error);
    throw error;
  }
}

// Backward-compatible exports
export const fetchLeads = fetchLeadsForKanban;
export const getLeadCountsByStatus = fetchLeadCounts;