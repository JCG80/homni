
import { useState } from 'react';
import { distributeLeadToProvider, DistributionStrategy } from '../../strategies/strategyFactory';
import { processUnassignedLeads } from '../../utils/processLeads';
import { processLeads } from '../../utils/leadDistributor';

export function useStrategyTesting() {
  const [category, setCategory] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processResult, setProcessResult] = useState<number | null>(null);
  const [useEnhanced, setUseEnhanced] = useState(true);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  };

  const testStrategy = async (selectedStrategy: DistributionStrategy) => {
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

  const runProcessUnassigned = async (selectedStrategy: DistributionStrategy) => {
    setLoading(true);
    try {
      let count;
      
      if (useEnhanced) {
        // Use enhanced implementation with retry capability
        count = await processLeads({
          strategy: selectedStrategy,
          showToasts: true,
          onlyNew: true,
          maxRetries: 3
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

  return {
    category,
    setCategory,
    handleCategoryChange,
    result,
    processResult,
    loading,
    useEnhanced,
    setUseEnhanced,
    testStrategy,
    runProcessUnassigned
  };
}
