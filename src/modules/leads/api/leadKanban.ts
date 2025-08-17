import { supabase } from '@/integrations/supabase/client';
import { LeadCounts } from '@/types/leads';
import { LeadStatus, normalizeStatus } from "@/types/leads";
import { Lead } from '@/types/leads';

export async function fetchLeadsForKanban(companyId?: string, userId?: string): Promise<any[]> {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('company_id', companyId);
  } else if (userId) {
    query = query.eq('submitted_by', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads for kanban:', error);
    throw error;
  }

  return data || [];
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<boolean> {
  // Map to emoji status for database (temporary until schema migration)
  const statusMap: Record<LeadStatus, string> = {
    new: '📥 new',
    qualified: '👀 qualified',
    contacted: '💬 contacted',
    negotiating: '📞 negotiating',
    converted: '✅ converted',
    lost: '❌ lost',
    paused: '⏸️ paused',
  };

  const { error } = await supabase
    .from('leads')
    .update({ 
      status: statusMap[status] as any,
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
    '📥 new': 0,
    '👀 qualified': 0,
    '💬 contacted': 0,
    '📞 negotiating': 0,
    '✅ converted': 0,
    '❌ lost': 0,
    '⏸️ paused': 0,
    new: 0,
    in_progress: 0,
    won: 0,
    lost: 0
  };

  try {
    let query = supabase
      .from('leads')
      .select('status');

    if (companyId) {
      query = query.eq('company_id', companyId);
    } else if (userId) {
      query = query.eq('submitted_by', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data) {
      data.forEach((lead) => {
        const normalizedStatus = normalizeStatus(lead.status as string);
        switch (normalizedStatus) {
          case 'new':
            counts.new++;
            counts['📥 new']++;
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
            counts['❌ lost']++;
            break;
          default:
            break;
        }
      });
    }

    return counts;
  } catch (error) {
    console.error('Error fetching lead counts:', error);
    throw error;
  }
}

// Backward-compatible exports
export const fetchLeads = fetchLeadsForKanban;
export const getLeadCountsByStatus = fetchLeadCounts;