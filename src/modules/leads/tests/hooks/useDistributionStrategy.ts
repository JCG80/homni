
import { useState, useEffect } from 'react';
import { DistributionStrategy } from '../../strategies/strategyFactory';
import { getCurrentStrategy, updateDistributionStrategy } from '../../utils/leadDistributor';
import { toast } from "@/components/ui/use-toast";

export function useDistributionStrategy() {
  const [selectedStrategy, setSelectedStrategy] = useState<DistributionStrategy>('roundRobin');
  const [currentDbStrategy, setCurrentDbStrategy] = useState<DistributionStrategy | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch current strategy on mount
  useEffect(() => {
    const fetchCurrentStrategy = async () => {
      const strategy = await getCurrentStrategy();
      setCurrentDbStrategy(strategy);
      setSelectedStrategy(strategy);
    };
    
    fetchCurrentStrategy();
  }, []);

  const saveAsDefaultStrategy = async () => {
    setIsSaving(true);
    try {
      const success = await updateDistributionStrategy(selectedStrategy);
      if (success) {
        setCurrentDbStrategy(selectedStrategy);
        toast({
          title: 'Strategy updated',
          description: `Default strategy set to ${selectedStrategy}`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'Failed to update default strategy',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      toast({
        title: 'Error saving strategy',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    selectedStrategy,
    setSelectedStrategy,
    currentDbStrategy,
    isSaving,
    saveAsDefaultStrategy
  };
}
