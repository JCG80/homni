import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { logger } from '@/utils/logger';
import { Lead, LeadStatus, normalizeLeadStatus } from '@/types/leads-canonical';

// Remove the local Lead interface since we're using the canonical one from types
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

        // Transform database response to canonical Lead format
        const transformedLeads: Lead[] = (data || []).map(dbLead => ({
          ...dbLead,
          status: normalizeLeadStatus(dbLead.status) as LeadStatus,
          metadata: (typeof dbLead.metadata === 'object' && dbLead.metadata !== null) 
            ? dbLead.metadata as Record<string, any> 
            : {}
        }));

        setLeads(transformedLeads);
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

      // Transform database response to canonical Lead format
      const transformedLeads: Lead[] = (data || []).map(dbLead => ({
        ...dbLead,
        status: normalizeLeadStatus(dbLead.status) as LeadStatus,
        metadata: (typeof dbLead.metadata === 'object' && dbLead.metadata !== null) 
          ? dbLead.metadata as Record<string, any> 
          : {}
      }));

      setLeads(transformedLeads);
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