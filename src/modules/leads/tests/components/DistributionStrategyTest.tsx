
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDistributionStrategy } from '../hooks/useDistributionStrategy';
import { useStrategyTesting } from '../hooks/useStrategyTesting';
import { StrategySelector } from './StrategySelector';
import { TestActionButtons } from './TestActionButtons';
import { TestResultDisplay } from './TestResultDisplay';

export const DistributionStrategyTest = () => {
  const { 
    selectedStrategy, 
    setSelectedStrategy, 
    currentDbStrategy, 
    isSaving, 
    saveAsDefaultStrategy 
  } = useDistributionStrategy();

  const {
    category,
    handleCategoryChange,
    result,
    processResult,
    loading,
    useEnhanced,
    setUseEnhanced,
    testStrategy,
    runProcessUnassigned
  } = useStrategyTesting();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Test Distribution Strategies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StrategySelector 
          selectedStrategy={selectedStrategy} 
          currentDbStrategy={currentDbStrategy}
          onStrategyChange={setSelectedStrategy}
        />

        {selectedStrategy === 'category_match' && (
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

        <TestActionButtons 
          onTestStrategy={() => testStrategy(selectedStrategy)}
          onProcessUnassigned={() => runProcessUnassigned(selectedStrategy)}
          onSaveAsDefault={saveAsDefaultStrategy}
          loading={loading}
          isSaving={isSaving}
          selectedStrategy={selectedStrategy}
          currentDbStrategy={currentDbStrategy}
          category={category}
        />

        <TestResultDisplay 
          result={result}
          processResult={processResult}
        />
      </CardContent>
    </Card>
  );
};
