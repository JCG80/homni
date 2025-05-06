
import { useState, useEffect } from 'react';
import { fetchLeadSettings } from '../../api/leadSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LeadSettings } from '../../api/leadSettings';

export const LeadSettingsTest = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchLeadSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Error fetching settings',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
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
        ) : settings ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-gray-500">Strategy:</span>
              <span className="font-medium">{settings.strategy}</span>
              
              <span className="text-gray-500">Budget:</span>
              <span className="font-medium">{settings.budget || 'Not set'}</span>
              
              <span className="text-gray-500">Daily Budget:</span>
              <span className="font-medium">{settings.daily_budget || 'Not set'}</span>
              
              <span className="text-gray-500">Monthly Budget:</span>
              <span className="font-medium">{settings.monthly_budget || 'Not set'}</span>
              
              <span className="text-gray-500">Global Pause:</span>
              <span className="font-medium">{settings.global_pause ? 'Yes' : 'No'}</span>
              
              <span className="text-gray-500">Agents Paused:</span>
              <span className="font-medium">{settings.agents_paused ? 'Yes' : 'No'}</span>
              
              <span className="text-gray-500">Globally Paused:</span>
              <span className="font-medium">{settings.globally_paused ? 'Yes' : 'No'}</span>
              
              <span className="text-gray-500">Last Updated:</span>
              <span className="font-medium">
                {new Date(settings.updated_at).toLocaleString()}
              </span>
              
              <span className="text-gray-500">Filters:</span>
              <span className="font-medium">
                {Object.keys(settings.filters).length > 0 
                  ? JSON.stringify(settings.filters, null, 2) 
                  : 'No filters'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-2">No settings found</p>
        )}

        <div className="mt-4">
          <Button 
            onClick={fetchSettings} 
            disabled={loading} 
            variant="outline" 
            className="w-full"
          >
            {loading ? 'Loading...' : 'Refresh Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
