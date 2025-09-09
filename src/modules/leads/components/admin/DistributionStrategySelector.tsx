
import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/use-toast";
import { DistributionStrategy, DISTRIBUTION_STRATEGIES } from '../../strategies/strategyFactory';
import { updateDistributionStrategy } from '../../utils/leadDistributor';

interface DistributionStrategySelectorProps {
  currentStrategy: DistributionStrategy | null;
  onStrategyChange: (strategy: DistributionStrategy) => void;
}

export const DistributionStrategySelector = ({ 
  currentStrategy, 
  onStrategyChange 
}: DistributionStrategySelectorProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState<DistributionStrategy | null>(currentStrategy);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveStrategy = async () => {
    if (!selectedStrategy || selectedStrategy === currentStrategy) return;
    
    setIsSaving(true);
    try {
      const success = await updateDistributionStrategy(selectedStrategy);
      if (success) {
        onStrategyChange(selectedStrategy);
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
  
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2 min-w-[200px]">
        <label className="text-sm font-medium">Distribusjonsstrategi</label>
        <Select
          value={selectedStrategy || ''}
          onValueChange={(value) => setSelectedStrategy(value as DistributionStrategy)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Velg strategi" />
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
    </div>
  );
};
