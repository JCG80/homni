
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DistributionStrategy, DISTRIBUTION_STRATEGIES } from '../strategies/strategyFactory';
import { getCurrentStrategy, updateDistributionStrategy, processLeads } from '../utils/leadDistributor';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { loadSettings } from '../utils/loadSettings';
import { supabase } from '@/integrations/supabase/client';
import { LeadsTabs } from '../components/LeadsTabs';

export const AdminLeadsPage = () => {
  const { isAdmin, isLoading } = useAuth();
  const [currentStrategy, setCurrentStrategy] = useState<DistributionStrategy | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<DistributionStrategy | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [strategyFetching, setStrategyFetching] = useState(true);
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [globalPause, setGlobalPause] = useState(false);
  const [autoDistribute, setAutoDistribute] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Fetch current strategy and settings on mount
  useEffect(() => {
    const fetchStrategyAndSettings = async () => {
      setStrategyFetching(true);
      setSettingsLoading(true);
      try {
        const strategy = await getCurrentStrategy();
        setCurrentStrategy(strategy);
        setSelectedStrategy(strategy);
        
        const settings = await loadSettings();
        if (settings) {
          setDailyBudget(settings.daily_budget?.toString() || '');
          setMonthlyBudget(settings.monthly_budget?.toString() || '');
          setGlobalPause(settings.global_pause);
          setAutoDistribute(settings.auto_distribute || false);
        }
      } catch (error) {
        console.error('Error fetching strategy or settings:', error);
      } finally {
        setStrategyFetching(false);
        setSettingsLoading(false);
      }
    };

    fetchStrategyAndSettings();
  }, []);

  const handleSaveStrategy = async () => {
    if (!selectedStrategy || selectedStrategy === currentStrategy) return;
    
    setIsSaving(true);
    try {
      const success = await updateDistributionStrategy(selectedStrategy);
      if (success) {
        setCurrentStrategy(selectedStrategy);
        toast({
          title: 'Strategy updated',
          description: `Lead distribution strategy updated to ${selectedStrategy}`,
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'Failed to update distribution strategy',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while updating the strategy',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lead_settings')
        .insert({
          strategy: selectedStrategy || currentStrategy || 'category_match',
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

  const handleRunDistribution = async () => {
    setIsProcessing(true);
    try {
      const count = await processLeads({
        strategy: selectedStrategy || undefined,
        showToasts: true,
      });
      
      // Toast is handled inside processLeads
    } catch (error) {
      toast({
        title: 'Distribution error',
        description: 'An error occurred during lead distribution',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div>Laster inn...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administrer leads</h1>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Lead distribusjon</h2>
        
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium">Distribusjonsstrategi</label>
            <Select
              value={selectedStrategy || ''}
              onValueChange={(value) => setSelectedStrategy(value as DistributionStrategy)}
              disabled={strategyFetching}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={strategyFetching ? 'Laster...' : 'Velg strategi'} />
              </SelectTrigger>
              <SelectContent>
                {DISTRIBUTION_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy} {currentStrategy === strategy ? '(current)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleSaveStrategy}
            disabled={isSaving || !selectedStrategy || selectedStrategy === currentStrategy}
          >
            {isSaving ? 'Lagrer...' : 'Lagre strategi'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRunDistribution}
            disabled={isProcessing || !selectedStrategy}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Behandler...
              </>
            ) : (
              'Distribuer ufordelte leads'
            )}
          </Button>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Lead innstillinger</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Daglig budsjett</label>
            <Input
              type="number"
              placeholder="Daglig budsjett"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              disabled={settingsLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Månedlig budsjett</label>
            <Input
              type="number"
              placeholder="Månedlig budsjett"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              disabled={settingsLoading}
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
          disabled={isSaving || settingsLoading}
          className="mt-2"
        >
          {isSaving ? 'Lagrer innstillinger...' : 'Lagre innstillinger'}
        </Button>
        
        {currentStrategy && (
          <p className="mt-4 text-sm text-gray-500">
            Gjeldende strategi: <span className="font-medium">{currentStrategy}</span>
          </p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Leads</h2>
        <LeadsTabs />
      </div>
    </div>
  );
};
