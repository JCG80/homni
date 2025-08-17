import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/types/leads';
import { fetchLeads, updateLeadStatus as apiUpdateLeadStatus } from '../api/leadKanban';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/leads';

interface UseKanbanBoardProps {
  companyId?: string;
  userId?: string;
}

export const useKanbanBoard = ({ companyId, userId }: UseKanbanBoardProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Partial<Record<LeadStatus, { id: LeadStatus; title: string }>> = {
    new: { id: 'new', title: 'New' },
    in_progress: { id: 'in_progress', title: 'In Progress' },
    won: { id: 'won', title: 'Won' },
    lost: { id: 'lost', title: 'Lost' },
    archived: { id: 'archived', title: 'Archived' },
    assigned: { id: 'assigned', title: 'Assigned' },
    under_review: { id: 'under_review', title: 'Under Review' },
    completed: { id: 'completed', title: 'Completed' },
  };

  const columnTitles = Object.values(columns).map(col => ({
    id: col.id,
    title: col.title,
  }));

  const fetchBoardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLeads = await fetchLeads(companyId, userId);
      if (fetchedLeads) {
        setLeads(fetchedLeads);
      }
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
    } catch (err: any) {
      // If there's an error, revert the optimistic update
      setLeads(prevLeads => {
        return prevLeads.map(lead => {
          // Find the lead that we tried to update
          if (lead.id === leadId) {
            // Revert the status to the original status
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
    }
  };

  const getLeadsForColumn = (columnId: LeadStatus) => {
    return leads.filter(lead => lead.status === columnId);
  };

  return {
    leads,
    isLoading,
    error,
    columnTitles,
    getLeadsForColumn,
    updateLeadStatus,
    fetchBoardData
  };
};
