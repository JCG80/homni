
import { useState, useEffect, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/modules/auth/hooks';
import { fetchLeads, updateLeadStatus, getLeadCountsByStatus } from '../api/leadKanban';
import { LeadStatus, Lead, LeadCounts } from '@/types/leads';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface KanbanColumn {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

export const useKanbanBoard = () => {
  const { user, isAuthenticated, profile, role, isCompany, isMember } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch leads based on user role
  const { 
    data: fetchedLeads = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['leads', user?.id, user?.company_id, role],
    queryFn: async () => {
      try {
        // For company users, filter by company_id
        // For member users, filter by user_id
        const companyId = isCompany ? user?.company_id : undefined;
        const userId = isMember ? user?.id : undefined;
        
        if (!companyId && !userId && isAuthenticated) {
          console.warn('No company ID or user ID available for leads query');
        }
        
        const leads = await fetchLeads(companyId, userId);
        // Transform to ensure they match the Lead interface
        return leads.map((lead: any): Lead => ({
          id: lead.id,
          title: lead.title || '',
          description: lead.description || '',
          status: lead.status as LeadStatus,
          category: lead.category || '',
          customer_name: lead.customer_name || '',
          customer_email: lead.customer_email || '',
          customer_phone: lead.customer_phone || '',
          service_type: lead.service_type || '',
          created_at: lead.created_at,
          company_id: lead.company_id,
          submitted_by: lead.submitted_by,
          updated_at: lead.updated_at,
          metadata: lead.metadata,
        }));
      } catch (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && (!!user?.company_id || !!user?.id)
  });
  
  // Fetch lead counts
  const { 
    data: leadCountsData = { new: 0, in_progress: 0, won: 0, lost: 0 },
    refetch: refetchCounts
  } = useQuery({
    queryKey: ['lead-counts', user?.id, user?.company_id, role],
    queryFn: async () => {
      try {
        const companyId = isCompany ? user?.company_id : undefined;
        const userId = isMember ? user?.id : undefined;
        
        if (!companyId && !userId && isAuthenticated) {
          return { new: 0, in_progress: 0, won: 0, lost: 0 } as LeadCounts;
        }
        
        return await getLeadCountsByStatus(companyId, userId);
      } catch (error) {
        console.error('Error fetching lead counts:', error);
        return { new: 0, in_progress: 0, won: 0, lost: 0 } as LeadCounts;
      }
    },
    enabled: isAuthenticated && (!!user?.company_id || !!user?.id)
  });
  
  // Update lead status mutation
  const { mutate } = useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) => {
      setIsUpdating(true);
      return await updateLeadStatus(leadId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-counts'] });
      toast({
        title: "Status updated",
        description: "Lead status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update lead status",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });
  
  // Create columns with leads organized by status
  const columns = useMemo(() => {
    const statusMap: Record<LeadStatus, { id: LeadStatus, title: string }> = {
      'new': { id: 'new', title: 'New' },
      'in_progress': { id: 'in_progress', title: 'In Progress' },
      'won': { id: 'won', title: 'Won' },
      'lost': { id: 'lost', title: 'Lost' },
      'archived': { id: 'archived', title: 'Archived' },
      'assigned': { id: 'assigned', title: 'Assigned' },
      'under_review': { id: 'under_review', title: 'Under Review' },
      'completed': { id: 'completed', title: 'Completed' }
    };
    
    const columnsData: KanbanColumn[] = [];
    
    // Create columns in specific order (excluding archived)
    ['new', 'in_progress', 'won', 'lost'].forEach(status => {
      const statusKey = status as LeadStatus;
      columnsData.push({
        id: statusKey,
        title: statusMap[statusKey].title,
        leads: fetchedLeads.filter(lead => lead.status === statusKey)
      });
    });
    
    return columnsData;
  }, [fetchedLeads]);
  
  // Handle updating lead status
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    mutate({ leadId, newStatus });
  };
  
  // Refresh all data
  const refreshLeads = () => {
    refetch();
    refetchCounts();
  };
  
  return {
    columns,
    leads: fetchedLeads,
    isLoading,
    isUpdating,
    error,
    leadCounts: leadCountsData,
    updateLeadStatus: handleUpdateLeadStatus,
    refreshLeads
  };
};
