import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadsTable } from '../components/LeadsTable';
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
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

export const AdminLeadsPage = () => {
  const { isAdmin, isLoading } = useAuth();
  const [currentStrategy, setCurrentStrategy] = useState<DistributionStrategy | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<DistributionStrategy | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [strategyFetching, setStrategyFetching] = useState(true);

  // Fetch current strategy on mount
  useEffect(() => {
    const fetchStrategy = async () => {
      setStrategyFetching(true);
      try {
        const strategy = await getCurrentStrategy();
        setCurrentStrategy(strategy);
        setSelectedStrategy(strategy);
      } catch (error) {
        console.error('Error fetching strategy:', error);
      } finally {
        setStrategyFetching(false);
      }
    };

    fetchStrategy();
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
        
        <div className="flex flex-wrap gap-4 items-end">
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
        
        {currentStrategy && (
          <p className="mt-2 text-sm text-gray-500">
            Gjeldende strategi: <span className="font-medium">{currentStrategy}</span>
          </p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Alle leads</h2>
        <LeadsTable />
      </div>
    </div>
  );
};
