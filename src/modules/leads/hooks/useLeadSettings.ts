
import { useState, useEffect } from 'react';
import { fetchLeadSettings, updateLeadSettings } from '../api/leadSettings';
import { LeadSettings } from '@/types/leads';
import { toast } from '@/hooks/use-toast';

export const useLeadSettings = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load settings on hook initialization
  useEffect(() => {
    loadSettings();
  }, []);

  // Function to load settings
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchLeadSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading lead settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save settings
  const saveSettings = async (updatedSettings: Partial<LeadSettings>) => {
    try {
      setIsSaving(true);
      await updateLeadSettings(updatedSettings);
      
      // Refresh settings after update
      await loadSettings();
      
      toast({
        title: "Settings updated",
        description: "Lead distribution settings have been saved",
      });
      
      return true;
    } catch (err) {
      console.error('Error saving lead settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      
      toast({
        title: "Update failed",
        description: "Could not save lead distribution settings",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    error,
    isSaving,
    loadSettings,
    saveSettings
  };
};
