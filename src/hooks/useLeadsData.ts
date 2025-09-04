/**
 * Real-time leads data hook for admin and company dashboards
 * Replaces mock data with actual Supabase queries
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Lead, LeadStatus, LEAD_STATUSES } from '@/types/leads-consolidated';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';

interface LeadsStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  todayCount: number;
  conversionRate: number;
  averageValue: number;
}

interface UseLeadsDataReturn {
  leads: Lead[];
  stats: LeadsStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateLeadStatus: (leadId: string, newStatus: LeadStatus) => Promise<void>;
}

export const useLeadsData = (companyOnly: boolean = false): UseLeadsDataReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const calculateStats = (leadsData: Lead[]): LeadsStats => {
    const total = leadsData.length;
    const byStatus: Record<LeadStatus, number> = LEAD_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<LeadStatus, number>
    );

    // Count by status
    leadsData.forEach(lead => {
      if (byStatus.hasOwnProperty(lead.status)) {
        byStatus[lead.status]++;
      }
    });

    // Today's leads
    const today = new Date().toISOString().split('T')[0];
    const todayCount = leadsData.filter(lead => 
      lead.created_at.startsWith(today)
    ).length;

    // Conversion rate (converted / total)
    const conversionRate = total > 0 ? (byStatus.converted / total) * 100 : 0;

    // Mock average value for now - could be calculated from lead metadata
    const averageValue = 2500;

    return {
      total,
      byStatus,
      todayCount,
      conversionRate: Math.round(conversionRate * 10) / 10,
      averageValue
    };
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('leads')
        .select(`
          id,
          title,
          description,
          category,
          status,
          lead_type,
          submitted_by,
          company_id,
          anonymous_email,
          session_id,
          attributed_at,
          confirmation_email_sent_at,
          created_at,
          updated_at,
          metadata
        `);

      // If company-only view, filter by company
      if (companyOnly && profile?.company_id) {
        query = query.eq('company_id', profile.company_id);
      }

      // Order by most recent first
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setLeads((data || []).map(lead => ({
        ...lead,
        metadata: lead.metadata as Record<string, any> || {}
      })));
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      toast.error('Kunne ikke hente leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus, updated_at: new Date().toISOString() }
            : lead
        )
      );

      toast.success('Lead status oppdatert');
    } catch (err) {
      console.error('Error updating lead status:', err);
      toast.error('Kunne ikke oppdatere lead status');
      throw err;
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [companyOnly, profile?.company_id]);

  const stats = calculateStats(leads);

  return {
    leads,
    stats,
    loading,
    error,
    refetch: fetchLeads,
    updateLeadStatus
  };
};

// Hook specifically for admin dashboard
export const useAdminLeadsData = () => useLeadsData(false);

// Hook specifically for company dashboard  
export const useCompanyLeadsData = () => useLeadsData(true);