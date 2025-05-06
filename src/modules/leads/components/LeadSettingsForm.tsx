
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { fetchLeadSettings, updateLeadSettings, LeadSettings } from '../api/leadSettings';
import { DistributionStrategy, DISTRIBUTION_STRATEGIES } from '../strategies/strategyFactory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const LeadSettingsForm = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [strategy, setStrategy] = useState<DistributionStrategy>('category_match');
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [globalPause, setGlobalPause] = useState(false);
  
  useEffect(() => {
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
          setGlobalPause(data.global_pause);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateLeadSettings({
        strategy,
        daily_budget: dailyBudget ? parseFloat(dailyBudget) : null,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        global_pause: globalPause,
        filters: settings?.filters || {}
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
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lead Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">Distribution Strategy</Label>
              <Select
                value={strategy}
                onValueChange={(value) => setStrategy(value as DistributionStrategy)}
              >
                <SelectTrigger id="strategy" className="w-full">
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRIBUTION_STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="daily-budget">Daily Budget</Label>
              <Input
                id="daily-budget"
                type="number"
                placeholder="Daily budget amount"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly-budget">Monthly Budget</Label>
              <Input
                id="monthly-budget"
                type="number"
                placeholder="Monthly budget amount"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="global-pause"
                checked={globalPause}
                onCheckedChange={setGlobalPause}
              />
              <Label htmlFor="global-pause">Global Pause</Label>
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="mt-4"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
