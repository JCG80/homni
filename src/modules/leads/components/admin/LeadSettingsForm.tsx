
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DistributionStrategy } from '../../strategies/strategyFactory';

interface LeadSettingsFormProps {
  initialSettings: {
    dailyBudget: string;
    monthlyBudget: string;
    globalPause: boolean;
    autoDistribute: boolean;
  };
  currentStrategy: DistributionStrategy | null;
  isLoading: boolean;
}

export const LeadSettingsForm = ({
  initialSettings,
  currentStrategy,
  isLoading
}: LeadSettingsFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [dailyBudget, setDailyBudget] = useState<string>(initialSettings.dailyBudget);
  const [monthlyBudget, setMonthlyBudget] = useState<string>(initialSettings.monthlyBudget);
  const [globalPause, setGlobalPause] = useState(initialSettings.globalPause);
  const [autoDistribute, setAutoDistribute] = useState(initialSettings.autoDistribute);
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lead_settings')
        .insert({
          strategy: currentStrategy || 'category_match',
          daily_budget: dailyBudget ? parseFloat(dailyBudget) : null,
          monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
          global_pause: globalPause,
          auto_distribute: autoDistribute,
          filters: {}
        });
      
      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'Update failed',
          description: 'Failed to save lead settings',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Settings updated',
        description: 'Lead settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error in saveSettings:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Lead innstillinger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Daglig budsjett</label>
          <Input
            type="number"
            placeholder="Daglig budsjett"
            value={dailyBudget}
            onChange={(e) => setDailyBudget(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Månedlig budsjett</label>
          <Input
            type="number"
            placeholder="Månedlig budsjett"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="globalPause"
          checked={globalPause}
          onChange={(e) => setGlobalPause(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="globalPause" className="ml-2 block text-sm">
          Pause alle leads (global pause)
        </label>
      </div>
      
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="autoDistribute"
          checked={autoDistribute}
          onChange={(e) => setAutoDistribute(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="autoDistribute" className="ml-2 block text-sm">
          Automatisk distribusjon av nye leads
        </label>
      </div>
      
      <Button 
        onClick={handleSaveSettings}
        disabled={isSaving || isLoading}
        className="mt-2"
      >
        {isSaving ? 'Lagrer innstillinger...' : 'Lagre innstillinger'}
      </Button>
      
      {currentStrategy && (
        <p className="mt-4 text-sm text-gray-500">
          Gjeldende strategi: <span className="font-medium">{currentStrategy}</span>
        </p>
      )}
    </>
  );
};
