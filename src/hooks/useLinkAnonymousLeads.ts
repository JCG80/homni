import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useLinkAnonymousLeads = () => {
  const [linkedCount, setLinkedCount] = useState<number>(0);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkLeads = async (userId: string, userEmail: string): Promise<number> => {
    setIsLinking(true);
    setError(null);
    
    try {
      // Call the database function to link anonymous leads
      const { data, error: dbError } = await supabase
        .rpc('link_anonymous_leads_to_user', {
          user_id_param: userId,
          user_email_param: userEmail
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      const count = data?.[0]?.linked_count || 0;
      setLinkedCount(count);
      return count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to link leads';
      setError(errorMessage);
      logger.error('Error linking anonymous leads:', {}, err);
      return 0;
    } finally {
      setIsLinking(false);
    }
  };

  return {
    linkLeads,
    linkedCount,
    isLinking,
    error
  };
};