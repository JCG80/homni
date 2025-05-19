
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { fetchLeads, updateLeadStatus, getLeadCountsByStatus } from '../api/leadKanban';
import { toast } from '@/hooks/use-toast';
import { Lead, LeadStatus } from '@/types/leads';

export interface KanbanColumn {
  id: string;
  title: string;
  leads: Lead[];
}

export interface LeadCounts {
  new: number;
  in_progress: number;
  won: number;
  lost: number;
}

export const useKanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [leadCounts, setLeadCounts] = useState<LeadCounts>({ new: 0, in_progress: 0, won: 0, lost: 0 });
  const { user, role } = useAuth();
  
  // Status definitions
  const columnDefinitions = [
    { id: 'new', title: 'Nye' },
    { id: 'in_progress', title: 'Pågående' },
    { id: 'won', title: 'Vunnet' },
    { id: 'lost', title: 'Tapt' }
  ];
  
  // Load leads
  const loadLeads = async () => {
    setIsLoading(true);
    try {
      if (!user) return;
      
      // For company users, use company_id, otherwise use user_id
      const companyId = user.company_id;
      const userId = user.id;
      
      // Fetch leads
      const fetchedLeads = await fetchLeads(companyId, userId);
      
      // Convert fetched leads to proper Lead type
      const typedLeads: Lead[] = fetchedLeads?.map(lead => ({
        ...lead,
        status: lead.status as LeadStatus,
        metadata: lead.metadata ? 
          (typeof lead.metadata === 'object' ? lead.metadata : JSON.parse(lead.metadata as string)) 
          : {}
      })) || [];
      
      setLeads(typedLeads);
      
      // Get lead counts by status
      const counts = await getLeadCountsByStatus(companyId, userId);
      setLeadCounts(counts);
      
      // Organize leads into columns
      organizeLeadsIntoColumns(typedLeads);
    } catch (error) {
      console.error("Error loading kanban data:", error);
      toast({
        title: "Feil ved lasting av Kanban",
        description: "Kunne ikke laste inn leads. Vennligst prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Organize leads into columns
  const organizeLeadsIntoColumns = (leads: Lead[]) => {
    const newColumns = columnDefinitions.map(col => ({
      ...col,
      leads: leads.filter(lead => lead.status === col.id)
    }));
    
    setColumns(newColumns);
  };
  
  // Update lead status
  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    // Find the lead to update
    const leadToUpdate = leads.find(lead => lead.id === leadId);
    if (!leadToUpdate) return;
    
    // Store the original status for rollback if needed
    const originalStatus = leadToUpdate.status;
    
    // Optimistically update UI
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    
    setLeads(updatedLeads);
    organizeLeadsIntoColumns(updatedLeads);
    
    // Update lead counts optimistically
    const newCounts = { ...leadCounts };
    if (originalStatus === 'new') newCounts.new--;
    if (originalStatus === 'in_progress') newCounts.in_progress--;
    if (originalStatus === 'won') newCounts.won--;
    if (originalStatus === 'lost') newCounts.lost--;
    
    if (newStatus === 'new') newCounts.new++;
    if (newStatus === 'in_progress') newCounts.in_progress++;
    if (newStatus === 'won') newCounts.won++;
    if (newStatus === 'lost') newCounts.lost++;
    
    setLeadCounts(newCounts);
    
    // Show updating indicator
    setIsUpdating(true);
    
    try {
      // Update in database
      await updateLeadStatus(leadId, newStatus);
      
      toast({
        title: "Lead oppdatert",
        description: `Status endret til ${newStatus}`,
      });
    } catch (error) {
      console.error("Failed to update lead status:", error);
      
      // Roll back optimistic update
      const rolledBackLeads = leads.map(lead => 
        lead.id === leadId ? { ...lead, status: originalStatus } : lead
      );
      
      setLeads(rolledBackLeads);
      organizeLeadsIntoColumns(rolledBackLeads);
      
      // Roll back lead counts
      setLeadCounts(leadCounts);
      
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere lead-status. Status er rullet tilbake.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadLeads();
  }, [user]);
  
  return {
    columns,
    leads,
    isLoading,
    isUpdating,
    leadCounts,
    updateLeadStatus: handleUpdateLeadStatus,
    refreshLeads: loadLeads
  };
};
