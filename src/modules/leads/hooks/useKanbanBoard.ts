
import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, LeadCounts } from '@/types/leads';
import { fetchLeads, updateLeadStatus as apiUpdateLeadStatus, getLeadCountsByStatus } from '../api/leadKanban';
import { toast } from '@/hooks/use-toast';

interface UseKanbanBoardProps {
  companyId?: string;
  userId?: string;
}

export interface KanbanColumn {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

export const useKanbanBoard = ({ companyId, userId }: UseKanbanBoardProps = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadCounts, setLeadCounts] = useState<Partial<LeadCounts>>({
    new: 0,
    in_progress: 0,
    won: 0,
    lost: 0
  });

  const columnDefinitions: Array<{ id: LeadStatus; title: string }> = [
    { id: '📥 new', title: 'New' },
    { id: '💬 contacted', title: 'Contacted' },
    { id: '📞 negotiating', title: 'Negotiating' },
    { id: '✅ converted', title: 'Won' },
    { id: '❌ lost', title: 'Lost' },
  ];

  const fetchBoardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLeads = await fetchLeads(companyId, userId);
      if (fetchedLeads) {
        // Transform DB data to Lead interface
        const transformedLeads: Lead[] = fetchedLeads.map(dbLead => ({
          id: dbLead.id,
          title: dbLead.title,
          description: dbLead.description,
          category: dbLead.category,
          status: dbLead.status as LeadStatus,
          customer_name: (dbLead.metadata as any)?.customer_name || '',
          customer_email: (dbLead.metadata as any)?.customer_email || '',
          customer_phone: (dbLead.metadata as any)?.customer_phone || '',
          service_type: (dbLead.metadata as any)?.service_type || dbLead.lead_type || '',
          zipCode: (dbLead.metadata as any)?.zipCode,
          company_id: dbLead.company_id || undefined,
          submitted_by: dbLead.submitted_by,
          created_at: dbLead.created_at,
          updated_at: dbLead.updated_at,
          metadata: dbLead.metadata as Record<string, any>,
          lead_type: dbLead.lead_type || undefined
        }));
        
        setLeads(transformedLeads);
      }

      // Fetch lead counts
      const counts = await getLeadCountsByStatus(companyId, userId);
      setLeadCounts(counts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
      toast({
        title: "Feil ved henting av leads",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, userId]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setIsUpdating(true);
    try {
      // Optimistically update the UI
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      // Call the API to update the status
      await apiUpdateLeadStatus(leadId, newStatus);
      
      toast({
        title: "Status oppdatert",
        description: "Lead status har blitt oppdatert.",
      });

      // Refresh counts
      const counts = await getLeadCountsByStatus(companyId, userId);
      setLeadCounts(counts);
    } catch (err: any) {
      // If there's an error, revert the optimistic update
      setLeads(prevLeads => {
        return prevLeads.map(lead => {
          if (lead.id === leadId) {
            const originalLead = leads.find(original => original.id === leadId);
            return originalLead ? { ...lead, status: originalLead.status } : lead;
          }
          return lead;
        });
      });
      
      setError(err.message || 'Failed to update lead status');
      
      toast({
        title: "Feil ved oppdatering av status",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getLeadsForColumn = (columnId: LeadStatus) => {
    return leads.filter(lead => lead.status === columnId);
  };

  const columns: KanbanColumn[] = columnDefinitions.map(col => ({
    id: col.id,
    title: col.title,
    leads: getLeadsForColumn(col.id)
  }));

  const refreshLeads = () => {
    fetchBoardData();
  };

  return {
    leads,
    isLoading,
    isUpdating,
    error,
    columns,
    leadCounts,
    columnTitles: columnDefinitions,
    getLeadsForColumn,
    updateLeadStatus,
    fetchBoardData,
    refreshLeads
  };
};
