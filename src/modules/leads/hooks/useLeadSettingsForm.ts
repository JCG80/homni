
import { useState, useEffect } from 'react';
import { fetchLeadSettings, updateLeadSettings } from '../api/leadSettings';
import { LeadSettings } from '@/types/leads';
import { DistributionStrategy } from '../strategies/strategyFactory';
import { toast } from '@/hooks/use-toast';

export const useLeadSettingsForm = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [strategy, setStrategy] = useState<DistributionStrategy>('category_match');
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [paused, setPaused] = useState(false);
  const [agentsPaused, setAgentsPaused] = useState(false);
  
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLeadSettings();
      setSettings(data);
      
      // Initialize form with current settings
      if (data) {
        setStrategy(data.strategy as DistributionStrategy);
        setDailyBudget(data.daily_budget?.toString() || '');
        setMonthlyBudget(data.monthly_budget?.toString() || '');
        setPaused(data.paused);
        setAgentsPaused(data.agents_paused);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      toast({
        title: 'Error loading settings',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Create a proper filters object
      const filtersObj: Record<string, any> = {};
      
      if (settings?.categories) {
        filtersObj.categories = settings.categories;
      }
      
      if (settings?.zipCodes) {
        filtersObj.zipCodes = settings.zipCodes;
      }
      
      await updateLeadSettings({
        strategy,
        daily_budget: dailyBudget ? parseFloat(dailyBudget) : null,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        globally_paused: paused,
        agents_paused: agentsPaused,
        filters: filtersObj
      });
      
      toast({
        title: 'Settings saved',
        description: 'Lead settings have been updated successfully.',
      });
      
      // Reload settings to get the latest
      const updatedSettings = await fetchLeadSettings();
      setSettings(updatedSettings);
    } catch (err) {
      toast({
        title: 'Error saving settings',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return {
    settings,
    loading,
    saving,
    error,
    strategy,
    dailyBudget,
    monthlyBudget,
    paused,
    agentsPaused,
    setStrategy,
    setDailyBudget,
    setMonthlyBudget,
    setPaused,
    setAgentsPaused,
    handleSave,
    loadSettings
  };
};
