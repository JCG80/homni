import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

export type AccessLevel = 'none' | 'basic' | 'contact' | 'full';

export interface ContactAccessInfo {
  leadId: string;
  companyId: string;
  accessLevel: AccessLevel;
  purchasedAt?: string;
  expiresAt?: string;
}

export const useContactAccess = (leadId: string, companyId?: string) => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('none');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const checkAccess = async () => {
    if (!leadId || !companyId || !user) {
      setAccessLevel('none');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .rpc('has_contact_access', {
          p_lead_id: leadId,
          p_company_id: companyId
        });

      if (error) throw error;

      setAccessLevel(data as AccessLevel);
    } catch (err) {
      console.error('Failed to check contact access:', err);
      setAccessLevel('none');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (leadId && companyId) {
      checkAccess();
    }
  }, [leadId, companyId, user]);

  // Utility functions for UI logic
  const canSeeContactInfo = () => accessLevel === 'contact' || accessLevel === 'full';
  const canSeeBasicInfo = () => accessLevel !== 'none';
  const hasAnyAccess = () => accessLevel !== 'none';

  const maskContactInfo = (info: string, type: 'email' | 'phone' | 'name' = 'email') => {
    if (canSeeContactInfo()) return info;
    
    if (!info) return 'Ikke tilgjengelig';
    
    switch (type) {
      case 'email':
        return '***@***.***';
      case 'phone':
        return '+47 *** ** ***';
      case 'name':
        return '*** ***';
      default:
        return '***';
    }
  };

  return {
    accessLevel,
    isLoading,
    canSeeContactInfo,
    canSeeBasicInfo,
    hasAnyAccess,
    maskContactInfo,
    refreshAccess: checkAccess
  };
};