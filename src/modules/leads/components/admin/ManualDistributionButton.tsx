
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { DistributionStrategy } from '../../strategies/strategyFactory';
import { processLeads } from '../../utils/leadDistributor';

interface ManualDistributionButtonProps {
  strategy: DistributionStrategy | null;
}

export const ManualDistributionButton = ({ strategy }: ManualDistributionButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleRunDistribution = async () => {
    setIsProcessing(true);
    try {
      await processLeads({
        strategy: strategy || undefined,
        showToasts: true,
      });
      // Toast is handled inside processLeads
    } catch (error) {
      console.error('Error during lead distribution:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleRunDistribution}
      disabled={isProcessing || !strategy}
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
  );
};
