
import { useState, useEffect } from 'react';
import { Lead } from '@/types/leads-canonical';
import { toast } from "@/hooks/use-toast";
import { fetchLeadsValidated } from '../api/lead-query';

export const useLeadsReport = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        
        // Get the date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Use the validated query builder with date range filter
        const validatedLeads = await fetchLeadsValidated({
          dateRange: {
            start: thirtyDaysAgo.toISOString()
          }
        });
        
        setLeads(validatedLeads);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        toast({
          title: 'Error fetching reports data',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);
  
  return {
    leads,
    loading,
    error,
  };
};
