import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/modules/auth/hooks/useAuthSession';
import { Lead, LeadStatus, LEAD_STATUSES } from '@/types/leads-canonical';
import { useAuth } from '@/modules/auth/hooks';
import { logger } from '@/utils/logger';
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
      logger.error('Error fetching leads:', {}, err);
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
      logger.error('Error updating lead status:', {}, err);
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

// Hook specifically for admin dashboard with companies
export const useAdminFullData = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads and companies in parallel
      const [leadsResult, companiesResult] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('company_profiles')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (companiesResult.error) throw companiesResult.error;

      const transformedLeads: Lead[] = (leadsResult.data || []).map(lead => ({
        id: lead.id,
        title: lead.title || '',
        description: lead.description || '',
        category: lead.category || '',
        status: lead.status || 'new',
        lead_type: lead.lead_type || 'general',
        submitted_by: lead.submitted_by,
        company_id: lead.company_id,
        anonymous_email: lead.anonymous_email,
        session_id: lead.session_id,
        attributed_at: lead.attributed_at,
        confirmation_email_sent_at: lead.confirmation_email_sent_at,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        metadata: lead.metadata as Record<string, any> || {}
      }));

      setLeads(transformedLeads);
      setCompanies(companiesResult.data || []);
    } catch (error) {
      logger.error('Error fetching admin data:', {}, error);
      toast.error('Kunne ikke hente data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { leads, companies, loading, refetch: fetchData };
};

// Hook specifically for admin dashboard
export const useAdminLeadsData = () => useLeadsData(false);

// Hook specifically for company dashboard  
export const useCompanyLeadsData = () => useLeadsData(true);