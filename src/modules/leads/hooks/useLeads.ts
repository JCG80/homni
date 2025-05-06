
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLeads, 
  getUserLeads, 
  getCompanyLeads, 
  createLead, 
  updateLeadStatus, 
  assignLeadToCompany, 
  getLeadById 
} from '../api/leads-api';
import { Lead, LeadFormValues, LeadStatus, LeadFilter } from '../types/types';
import { useAuth } from '@/modules/auth/hooks/useAuth';

// Hook to get leads based on user role
export const useLeadList = (filters: LeadFilter = {}) => {
  const { user, profile, isAdmin, isCompany } = useAuth();
  
  return useQuery({
    queryKey: ['leads', filters, user?.id, profile?.role],
    queryFn: async () => {
      if (!user) return [];
      
      // Admin sees all leads, with optional filters
      if (isAdmin) {
        return getLeads(filters);
      }
      
      // Company sees assigned leads
      if (isCompany && profile?.company_id) {
        return getCompanyLeads(profile.company_id);
      }
      
      // Regular user sees own leads
      return getUserLeads(user.id);
    },
    enabled: !!user
  });
};

// Hook to get a specific lead
export const useLead = (leadId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => getLeadById(leadId as string),
    enabled: !!leadId && !!user
  });
};

// Hook to create a new lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (newLead: LeadFormValues) => {
      if (!user) throw new Error('User is not authenticated');
      return createLead(newLead, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

// Hook to update lead status
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      return updateLeadStatus(leadId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

// Hook to assign lead to company
export const useAssignLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, companyId }: { leadId: string; companyId: string }) => {
      return assignLeadToCompany(leadId, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};
