
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchLeadSettings, updateLeadSettings } from '../api/leadSettings';
import { DistributionStrategy } from '../strategies/strategyFactory';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/components/ui/use-toast";
import { LeadSettings } from "@/types/leads-canonical";

export const CompanyLeadSettings = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchLeadSettings();
        setSettings(data);
        
        // Initialize the paused state
        if (data) {
          setPaused(data.paused);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        toast({
          title: 'Error',
          description: 'Failed to load lead distribution settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const togglePause = async () => {
    try {
      const newPausedState = !paused;
      setPaused(newPausedState);
      
      await updateLeadSettings({ 
        globally_paused: newPausedState,
        // Keep other settings the same
        strategy: settings?.strategy as DistributionStrategy,
        filters: settings?.filters || {},
        daily_budget: settings?.daily_budget,
        monthly_budget: settings?.monthly_budget,
      });
      
      toast({
        title: newPausedState ? 'Leads paused' : 'Leads active',
        description: newPausedState ? 
          'Lead distribution has been paused' : 
          'Lead distribution has been activated',
      });
    } catch (err) {
      console.error('Error toggling pause state:', err);
      setPaused(!paused); // Revert the state change
      toast({
        title: 'Error',
        description: 'Failed to update lead distribution settings',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading settings</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lead Distribution Settings</span>
          <Badge variant={paused ? "destructive" : "default"} className={paused ? "" : "bg-green-100 text-green-800 hover:bg-green-100"}>
            {paused ? "Paused" : "Active"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Lead Distribution</h3>
            <p className="text-sm text-gray-500">
              {paused ? 
                'Currently not receiving new leads' : 
                'Currently receiving new leads based on settings'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="pause-leads" 
              checked={!paused}
              onCheckedChange={() => togglePause()}
            />
            <Label htmlFor="pause-leads">{paused ? 'Resume' : 'Pause'}</Label>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Current Settings</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-500">Distribution Strategy:</span>
            <span className="font-medium">{settings?.strategy || 'Not set'}</span>
            
            <span className="text-gray-500">Daily Budget:</span>
            <span className="font-medium">
              {settings?.daily_budget ? `${settings.daily_budget} kr` : 'Not set'}
            </span>
            
            <span className="text-gray-500">Monthly Budget:</span>
            <span className="font-medium">
              {settings?.monthly_budget ? `${settings.monthly_budget} kr` : 'Not set'}
            </span>
            
            <span className="text-gray-500">Category Filters:</span>
            <span className="font-medium">
              {settings?.categories && 
               Array.isArray(settings.categories) && 
               settings.categories.length > 0 
                ? settings.categories.join(', ') 
                : 'No filters'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
