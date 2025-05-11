
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { DistributionStrategy } from '../strategies/strategyFactory';
import { fetchLeadSettings, updateLeadSettings } from '../api/leadSettings';
import { getCurrentStrategy, updateDistributionStrategy } from '../utils/leadDistributor';

// Hook for managing lead settings form state and operations
export function useLeadSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [strategy, setStrategy] = useState<DistributionStrategy>('category_match');
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [paused, setPaused] = useState(false);
  const [agentsPaused, setAgentsPaused] = useState(false);
  
  // Load initial settings
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load strategy
      const currentStrategy = await getCurrentStrategy();
      setStrategy(currentStrategy);
      
      // Load other settings
      const settings = await fetchLeadSettings();
      
      if (settings) {
        setDailyBudget(settings.daily_budget?.toString() || '');
        setMonthlyBudget(settings.monthly_budget?.toString() || '');
        setPaused(settings.globally_paused || settings.global_pause);
        setAgentsPaused(settings.agents_paused);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load lead settings');
      toast({
        title: 'Error',
        description: 'Failed to load lead settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update strategy if changed
      await updateDistributionStrategy(strategy);
      
      // Update other settings
      await updateLeadSettings({
        daily_budget: dailyBudget ? parseFloat(dailyBudget) : null,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        globally_paused: paused,
        agents_paused: agentsPaused,
        filters: {}
      });
      
      toast({
        title: 'Settings saved',
        description: 'Lead distribution settings have been updated',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to save lead settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return {
    loading,
    error,
    saving,
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
}
