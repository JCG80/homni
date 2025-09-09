import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus, PipelineStage, normalizeStatus, statusToPipeline, PIPELINE_LABELS, LeadCounts } from '@/types/leads-canonical';
import { fetchLeads, updateLeadStatus as apiUpdateLeadStatus, getLeadCountsByStatus } from '../api/leadKanban';
import { KanbanColumn } from '../components/kanban/types';
import { toast } from "@/components/ui/use-toast";
import { UseKanbanBoardProps } from '@/types/hooks';

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

  const columnDefinitions: Array<{ id: PipelineStage; title: string; status: LeadStatus }> = [
    { id: 'new', title: PIPELINE_LABELS.new, status: 'new' },
    { id: 'in_progress', title: PIPELINE_LABELS.in_progress, status: 'qualified' },
    { id: 'won', title: PIPELINE_LABELS.won, status: 'converted' },
    { id: 'lost', title: PIPELINE_LABELS.lost, status: 'lost' },
  ];

  const fetchBoardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLeads = await fetchLeads(companyId, userId);
      setLeads(fetchedLeads);

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

  const getLeadsForColumn = (columnId: PipelineStage) => {
    return leads.filter(lead => lead.pipeline_stage === columnId);
  };

  const columns: KanbanColumn[] = columnDefinitions.map(col => {
    const columnLeads = getLeadsForColumn(col.id);
    return {
      id: col.id,
      title: col.title,
      status: col.status,
      count: columnLeads.length,
      leads: columnLeads.map(lead => ({
        id: lead.id,
        title: lead.title,
        description: lead.description,
        category: lead.category,
        status: lead.status,
        created_at: lead.created_at
      }))
    };
  });

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
