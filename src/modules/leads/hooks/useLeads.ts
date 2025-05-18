
import { useState } from 'react';
import { insertLead } from '../api/lead-create';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Lead } from '@/types/leads';
import { getLeads, getUserLeads, getCompanyLeads, getLeadById } from '../api/lead-list';

export const useCreateLead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Improved error handling in the useMutation hook
  const mutation = useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      if (!user) {
        throw new Error('Authentication required to create a lead');
      }
      
      try {
        return await insertLead({
          ...leadData,
          submitted_by: user.id,
        });
      } catch (err: any) {
        console.error('Error creating lead:', err);
        // Enhanced error logging
        if (err.code === 'PGRST301') {
          throw new Error('Authentication error: Your session may have expired');
        } else if (err.code === '42501') {
          throw new Error('Authorization error: You do not have permission to create leads');
        } else {
          throw err;
        }
      }
    },
    onSuccess: () => {
      // Clear any previous errors
      setError(null);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: Error) => {
      console.error('Mutation error:', err);
      setError(err);
    }
  });

  return {
    createLead: mutation.mutate,
    isLoading: mutation.isPending, // Changed isLoading to isPending for the new TanStack Query v5 API
    error
  };
};

export const useLeadsList = () => {
  // Implement proper fetching from Supabase with error handling
  const { isAuthenticated, user, role } = useAuth();
  const { data: leads = [], isPending, error } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      try {
        console.log('Fetching leads with role:', role);
        
        // Different fetching strategies based on user role
        if (!isAuthenticated || !user) {
          console.log('User not authenticated, returning empty leads array');
          return [] as Lead[];
        }
        
        if (role === 'admin' || role === 'master_admin') {
          console.log('Admin user, fetching all leads');
          return await getLeads();
        } 
        
        if (role === 'company') {
          console.log('Company user, fetching company leads');
          return await getCompanyLeads(user.company_id || '');
        }
        
        // Default for regular users - fetch their own leads
        console.log('Regular user, fetching user leads');
        return await getUserLeads(user.id);
      } catch (err) {
        console.error('Error fetching leads:', err);
        throw err;
      }
    },
    enabled: isAuthenticated && !!user,
  });

  return {
    leads,
    isLoading: isPending,
    error
  };
};

export const useLead = (id: string) => {
  const { isAuthenticated } = useAuth();
  
  const { data: lead, isPending, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      if (!id) {
        console.log('No lead ID provided');
        return null;
      }
      
      try {
        const leadData = await getLeadById(id);
        return leadData;
      } catch (err) {
        console.error(`Error fetching lead ${id}:`, err);
        throw err;
      }
    },
    enabled: isAuthenticated && !!id,
  });
  
  return {
    lead,
    isLoading: isPending,
    error
  };
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      // This is a placeholder implementation
      // In a real implementation, we would call an API to update the lead status
      console.log(`Updating lead ${leadId} status to ${status}`);
      return { success: true };
    },
    onSuccess: () => {
      // Clear any previous errors
      setError(null);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: Error) => {
      console.error('Mutation error:', err);
      setError(err);
    }
  });

  return {
    updateStatus: (leadId: string, status: string) => mutation.mutate({ leadId, status }),
    isLoading: mutation.isPending,
    error
  };
};
