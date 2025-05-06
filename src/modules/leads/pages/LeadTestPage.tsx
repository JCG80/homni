
import { useState, useEffect } from 'react';
import { LeadSettingsForm } from '../components/LeadSettingsForm';
import { LeadSettingsTest } from '../tests/components/LeadSettingsTest';
import { Button } from '@/components/ui/button';
import { fetchLeadSettings, pauseForAgents, globalPause, LeadSettings } from '../api/leadSettings';
import { toast } from '@/hooks/use-toast';

export const LeadTestPage = () => {
  const [settings, setSettings] = useState<LeadSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSet = async () => {
    try {
      setLoading(true);
      const data = await fetchLeadSettings();
      setSettings(data);
    } catch (err) {
      toast({
        title: 'Error fetching settings',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSet();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Lead Test Page</h1>
      
      {settings && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => pauseForAgents(!settings.agents_paused).then(() => fetchAndSet())}
            variant="warning"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            {settings.agents_paused ? 'Start egne leads' : 'Pause egne leads'}
          </Button>
          <Button
            onClick={() => globalPause(!settings.globally_paused).then(() => fetchAndSet())}
            variant="destructive"
          >
            {settings.globally_paused ? 'Gjenoppta globalt' : 'Stopp alle leads'}
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Settings Form</h2>
          <LeadSettingsForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Settings Display</h2>
          <LeadSettingsTest />
        </div>
      </div>
    </div>
  );
};

// Add authorization requirements
LeadTestPage.requireAuth = true;
LeadTestPage.allowedRoles = ['admin', 'master-admin'];

