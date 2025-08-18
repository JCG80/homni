import { supabase } from '@/integrations/supabase/client';
import { LeadCounts, Lead, LeadStatus, normalizeStatus, statusToPipeline } from '@/types/leads';

export async function fetchLeadsForKanban(companyId?: string, userId?: string): Promise<Lead[]> {
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

  return (data || []).map((row: any) => {
    // Safely extract metadata
    const metadata = typeof row.metadata === 'object' && row.metadata !== null 
      ? row.metadata as Record<string, unknown>
      : {};

    // Transform the raw data to match Lead interface
    const normalizedStatus = normalizeStatus(row.status);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      lead_type: row.lead_type || '',
      status: normalizedStatus,
      pipeline_stage: statusToPipeline(normalizedStatus),
      customer_name: metadata.customer_name as string || null,
      customer_email: metadata.customer_email as string || null,
      customer_phone: metadata.customer_phone as string || null,
      service_type: metadata.service_type as string || null,
      submitted_by: row.submitted_by,
      company_id: row.company_id,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
      metadata
    } satisfies Lead;
  });
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