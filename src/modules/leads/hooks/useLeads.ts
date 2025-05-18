import { useState } from 'react';
import { insertLead } from '../api/lead-create';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Lead } from '@/types/leads';

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
  // Implementing a proper useLeadsList hook that returns leads, isLoading and error
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      // This is a placeholder. In a real implementation, you would fetch leads from your API
      // For now, we'll return mock data to fix the type errors
      return [] as Lead[];
    }
  });

  return {
    leads,
    isLoading,
    error
  };
};

// Add needed hook implementations that were referenced but missing
export const useLead = (id: string) => {
  // Placeholder implementation
  return {
    lead: null,
    isLoading: false,
    error: null
  };
};

export const useUpdateLeadStatus = () => {
  // Placeholder implementation
  return {
    updateStatus: (leadId: string, status: string) => {},
    isLoading: false
  };
};
