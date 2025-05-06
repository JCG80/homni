import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { distributeLeadToProvider, DistributionStrategy, DISTRIBUTION_STRATEGIES } from '../../strategies/strategyFactory';
import { Input } from '@/components/ui/input';
import { processUnassignedLeads } from '../../utils/processLeads';
import { processLeads, getCurrentStrategy, updateDistributionStrategy } from '../../utils/leadDistributor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export const DistributionStrategyTest = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<DistributionStrategy>('roundRobin');
  const [category, setCategory] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processResult, setProcessResult] = useState<number | null>(null);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDbStrategy, setCurrentDbStrategy] = useState<DistributionStrategy | null>(null);

  // Fetch current strategy on mount
  useEffect(() => {
    const fetchCurrentStrategy = async () => {
      const strategy = await getCurrentStrategy();
      setCurrentDbStrategy(strategy);
      setSelectedStrategy(strategy);
    };
    
    fetchCurrentStrategy();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const testStrategy = async () => {
    setLoading(true);
    try {
      const providerId = await distributeLeadToProvider(selectedStrategy, category);
      setResult(providerId);
    } catch (error) {
      console.error('Error testing strategy:', error);
      setResult('Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const runProcessUnassigned = async () => {
    setLoading(true);
    try {
      let count;
      
      if (useEnhanced) {
        // Use enhanced implementation
        count = await processLeads({
          strategy: selectedStrategy,
          showToasts: true,
          onlyNew: true
        });
      } else {
        // Use legacy implementation
        count = await processUnassignedLeads(selectedStrategy);
      }
      
      setProcessResult(count);
    } catch (error) {
      console.error('Error processing leads:', error);
      setProcessResult(0);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Test Distribution Strategies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Distribution Strategy</label>
          <Select
            value={selectedStrategy}
            onValueChange={(value) => setSelectedStrategy(value as DistributionStrategy)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a strategy" />
            </SelectTrigger>
            <SelectContent>
              {DISTRIBUTION_STRATEGIES.map((strategy) => (
                <SelectItem key={strategy} value={strategy}>
                  {strategy} {currentDbStrategy === strategy ? '(Current Default)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-sm text-gray-500 mt-1">
            {currentDbStrategy && `Current default strategy: ${currentDbStrategy}`}
          </div>
        </div>

        {selectedStrategy === 'categoryMatch' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              placeholder="Enter lead category"
              value={category}
              onChange={handleCategoryChange}
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="use-enhanced" 
            checked={useEnhanced} 
            onCheckedChange={setUseEnhanced} 
          />
          <Label htmlFor="use-enhanced">Use enhanced lead distributor</Label>
        </div>

        <div className="space-y-2 pt-2 flex flex-wrap gap-2">
          <Button 
            onClick={testStrategy} 
            disabled={loading || (selectedStrategy === 'categoryMatch' && !category)}
          >
            {loading ? 'Testing...' : 'Test Strategy'}
          </Button>

          <Button 
            variant="outline" 
            onClick={runProcessUnassigned} 
            disabled={loading}
          >
            Process Unassigned Leads
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={saveAsDefaultStrategy} 
            disabled={loading || isSaving || selectedStrategy === currentDbStrategy}
          >
            {isSaving ? 'Saving...' : 'Set as Default Strategy'}
          </Button>
        </div>

        {result !== null && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium">Result:</p>
            <pre className="mt-1 p-2 bg-gray-100 rounded-md overflow-auto text-sm">
              {result || 'No provider found'}
            </pre>
          </div>
        )}

        {processResult !== null && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium">Processed Leads:</p>
            <pre className="mt-1 p-2 bg-gray-100 rounded-md overflow-auto text-sm">
              {processResult} leads assigned
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
