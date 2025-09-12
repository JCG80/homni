
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/use-toast";
import { DistributionStrategy } from '../../strategies/strategyFactory';
import { DistributionStrategySelector } from './DistributionStrategySelector';
import { processUnassignedLeads } from '../../utils/processLeads';
import { LeadSettingsForm } from '../LeadSettingsForm';

interface LeadDistributionPanelProps {
  currentStrategy: DistributionStrategy | null;
  setCurrentStrategy: (strategy: DistributionStrategy) => void;
  settings: {
    dailyBudget: string;
    monthlyBudget: string;
    globalPause: boolean;
    autoDistribute: boolean;
  };
  isLoading: boolean;
}

export const LeadDistributionPanel = ({
  currentStrategy,
  setCurrentStrategy,
  settings,
  isLoading
}: LeadDistributionPanelProps) => {
  const [distributing, setDistributing] = useState(false);
  
  // Handle distribution of leads manually
  const handleDistributeLeads = async () => {
    if (!currentStrategy) {
      toast({
        title: 'Ingen strategi valgt',
        description: 'Velg en distribusjonsstrategi først',
        variant: 'destructive',
      });
      return;
    }
    
    setDistributing(true);
    try {
      const count = await processUnassignedLeads(currentStrategy);
      
      if (count > 0) {
        toast({
          title: 'Leads distribuert',
          description: `${count} leads ble fordelt til bedrifter`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Ingen leads å fordele',
          description: 'Det er ingen nye leads som venter på tildeling',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error distributing leads:', error);
      toast({
        title: 'Feil ved distribusjon',
        description: 'En feil oppsto under fordeling av leads',
        variant: 'destructive',
      });
    } finally {
      setDistributing(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lead distribusjon</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Distribusjonsstrategi</h3>
            <p className="text-sm text-gray-600">
              Velg hvordan nye leads skal fordeles til bedrifter
            </p>
            
            <DistributionStrategySelector
              currentStrategy={currentStrategy}
              onStrategyChange={setCurrentStrategy}
            />
          </section>
          
          <div className="border-t pt-4">
            {/* Use the modern LeadSettingsForm component */}
            <LeadSettingsForm />
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Manuell distribusjon</h3>
            <div className="flex space-x-4">
              <Button 
                onClick={handleDistributeLeads} 
                disabled={distributing}
                variant="default"
              >
                {distributing ? 'Fordeler leads...' : 'Fordel leads nå'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dette vil fordele alle ventende leads til bedrifter basert på valgt strategi.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
