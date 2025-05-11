
import { useState, useEffect } from 'react';
import { LeadSettings } from '../types/lead-settings';
import { fetchLeadSettings, updateLeadSettings } from '../api/leadSettings';
import { useAuth } from '@/modules/auth/hooks/useAuth';

/**
 * Hook for managing lead settings with support for company-specific configurations
 * @param companyId Optional company ID for company-specific settings
 */
export const useLeadSettings = (companyId?: string) => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  
  // Use company ID from profile if it's a company user and none was provided
  const effectiveCompanyId = companyId || (profile?.role === 'company' ? profile.company_id : undefined);
  
  // Load settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLeadSettings(effectiveCompanyId);
        setSettings(data);
      } catch (err) {
        console.error('Error fetching lead settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [effectiveCompanyId]);
  
  // Update settings in database
  const saveSettings = async (updatedSettings: Partial<LeadSettings>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      await updateLeadSettings({
        ...updatedSettings,
        company_id: effectiveCompanyId || null
      });
      
      // Update local state with new settings
      setSettings(prev => prev ? { ...prev, ...updatedSettings } : updatedSettings as LeadSettings);
      return true;
    } catch (err) {
      console.error('Error saving lead settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    settings,
    isLoading,
    error,
    saveSettings
  };
};
