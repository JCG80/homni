
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, isValidLeadStatus } from '@/types/leads';
import { toast } from '@/hooks/use-toast';
import { parseLead } from '../utils/parseLead';

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
          .select('*')  // Select all fields to ensure we get customer details
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Use the shared parseLead utility to ensure all lead fields are properly handled
        if (data) {
          const validatedLeads = data.map(item => parseLead(item)) as Lead[];
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
