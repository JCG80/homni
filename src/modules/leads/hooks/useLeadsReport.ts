
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, isValidLeadStatus } from '@/types/leads';
import { toast } from '@/hooks/use-toast';

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
        
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Safely validate and map each lead to ensure status is valid
        if (data) {
          const validatedLeads = data.map(item => ({
            ...item,
            status: isValidLeadStatus(item.status) ? item.status : 'new',
          })) as Lead[];
          
          setLeads(validatedLeads);
        } else {
          setLeads([]);
        }
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
