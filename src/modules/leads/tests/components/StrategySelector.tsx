
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DistributionStrategy, DISTRIBUTION_STRATEGIES } from '../../strategies/strategyFactory';

interface StrategySelectorProps {
  selectedStrategy: DistributionStrategy;
  currentDbStrategy: DistributionStrategy | null;
  onStrategyChange: (value: DistributionStrategy) => void;
}

export const StrategySelector = ({ 
  selectedStrategy, 
  currentDbStrategy, 
  onStrategyChange 
}: StrategySelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Distribution Strategy</label>
      <Select
        value={selectedStrategy}
        onValueChange={(value) => onStrategyChange(value as DistributionStrategy)}
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
  );
};
