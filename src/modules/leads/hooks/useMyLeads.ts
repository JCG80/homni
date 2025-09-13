import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { logger } from '@/utils/logger';

export interface Lead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  submitted_by?: string;
  company_id?: string;
  metadata?: any; // Using any to match Supabase Json type
  anonymous_email?: string;
  attributed_at?: string;
  confirmation_email_sent_at?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  lead_type?: string;
  session_id?: string;
  smart_start_submission_id?: string;
}

export const useMyLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('leads')
          .select('*')
          .eq('submitted_by', user.id)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setLeads(data || []);
      } catch (err) {
        logger.error('Failed to fetch user leads', {
          module: 'useMyLeads',
          userId: user.id
        }, err as Error);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('leads')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setLeads(data || []);
    } catch (err) {
      logger.error('Failed to refetch user leads', {
        module: 'useMyLeads',
        userId: user.id
      }, err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    leads,
    isLoading,
    error,
    refetch
  };
};