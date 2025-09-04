/**
 * Enhanced hook for company dashboard with real-time lead management
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/leads-consolidated';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';

interface CompanyDashboardData {
  assignedLeads: Lead[];
  todayLeads: Lead[];
  pendingLeads: Lead[];
  convertedLeads: Lead[];
  stats: {
    totalAssigned: number;
    todayCount: number;
    conversionRate: number;
    responseTimeAvg: number;
  };
  loading: boolean;
  error: string | null;
}

export const useCompanyDashboard = () => {
  const [data, setData] = useState<CompanyDashboardData>({
    assignedLeads: [],
    todayLeads: [],
    pendingLeads: [],
    convertedLeads: [],
    stats: {
      totalAssigned: 0,
      todayCount: 0,
      conversionRate: 0,
      responseTimeAvg: 0
    },
    loading: true,
    error: null
  });

  const { user, profile } = useAuth();

  const fetchDashboardData = async () => {
    if (!user || !profile?.company_id) {
      setData(prev => ({ ...prev, loading: false, error: 'No company ID found' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch leads assigned to this company
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Process leads
      const assignedLeads = (leads || []).map(lead => ({
        ...lead,
        metadata: lead.metadata as Record<string, any> | undefined
      })) as Lead[];
      const todayLeads = assignedLeads.filter(lead => 
        new Date(lead.created_at) >= todayStart
      );
      const pendingLeads = assignedLeads.filter(lead => 
        ['new', 'qualified', 'contacted'].includes(lead.status)
      );
      const convertedLeads = assignedLeads.filter(lead => 
        lead.status === 'converted'
      );

      // Calculate stats
      const totalAssigned = assignedLeads.length;
      const todayCount = todayLeads.length;
      const conversionRate = totalAssigned > 0 
        ? (convertedLeads.length / totalAssigned) * 100 
        : 0;

      setData({
        assignedLeads,
        todayLeads,
        pendingLeads,
        convertedLeads,
        stats: {
          totalAssigned,
          todayCount,
          conversionRate,
          responseTimeAvg: 2.4 // Mock for now
        },
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
      
      return true;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, profile]);

  return {
    ...data,
    refetch: fetchDashboardData,
    updateLeadStatus
  };
};