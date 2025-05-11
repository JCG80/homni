
import { Button } from '@/components/ui/button';
import { DistributionStrategy } from '../../strategies/strategyFactory';

interface TestActionButtonsProps {
  onTestStrategy: () => void;
  onProcessUnassigned: () => void;
  onSaveAsDefault: () => void;
  loading: boolean;
  isSaving: boolean;
  selectedStrategy: DistributionStrategy;
  currentDbStrategy: DistributionStrategy | null;
  category: string;
}

export const TestActionButtons = ({ 
  onTestStrategy, 
  onProcessUnassigned, 
  onSaveAsDefault,
  loading,
  isSaving,
  selectedStrategy,
  currentDbStrategy,
  category
}: TestActionButtonsProps) => {
  return (
    <div className="space-y-2 pt-2 flex flex-wrap gap-2">
      <Button 
        onClick={onTestStrategy} 
        disabled={loading || (selectedStrategy === 'category_match' && !category)}
      >
        {loading ? 'Testing...' : 'Test Strategy'}
      </Button>

      <Button 
        variant="outline" 
        onClick={onProcessUnassigned} 
        disabled={loading}
      >
        Process Unassigned Leads
      </Button>
      
      <Button 
        variant="secondary" 
        onClick={onSaveAsDefault} 
        disabled={loading || isSaving || selectedStrategy === currentDbStrategy}
      >
        {isSaving ? 'Saving...' : 'Set as Default Strategy'}
      </Button>
    </div>
  );
};
