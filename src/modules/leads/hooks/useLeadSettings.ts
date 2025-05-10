import { useState, useEffect } from 'react';
import { LeadSettings } from '../types/lead-settings';
import { supabase } from '@/integrations/supabase/client';
import { parseLeadSettings } from '../utils/parseLeadSettings';

export const useLeadSettings = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('lead_settings')
          .select('*')
          .maybeSingle();
        
        if (error) throw new Error(error.message);
        
        const parsedSettings = parseLeadSettings(data);
        setSettings(parsedSettings);
      } catch (err) {
        console.error('Error fetching lead settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Update settings in database
  const saveSettings = async (updatedSettings: Partial<LeadSettings>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // If we have existing settings, update them
      if (settings?.id) {
        const { error } = await supabase
          .from('lead_settings')
          .update({
            ...updatedSettings,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);
        
        if (error) throw new Error(error.message);
      } 
      // Otherwise, insert new settings
      else {
        const { error } = await supabase
          .from('lead_settings')
          .insert([{
            ...updatedSettings,
            updated_at: new Date().toISOString()
          }]);
        
        if (error) throw new Error(error.message);
      }
      
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
