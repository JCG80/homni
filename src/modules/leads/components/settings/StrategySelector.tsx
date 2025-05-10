
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DistributionStrategy, DISTRIBUTION_STRATEGIES } from '../../strategies/strategyFactory';

interface StrategySelectorProps {
  strategy: DistributionStrategy;
  onChange: (value: DistributionStrategy) => void;
}

export const StrategySelector = ({ strategy, onChange }: StrategySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="strategy">Distribution Strategy</Label>
      <Select
        value={strategy}
        onValueChange={(value) => onChange(value as DistributionStrategy)}
      >
        <SelectTrigger id="strategy" className="w-full">
          <SelectValue placeholder="Select a strategy" />
        </SelectTrigger>
        <SelectContent>
          {DISTRIBUTION_STRATEGIES.map((strategyOption) => (
            <SelectItem key={strategyOption} value={strategyOption}>
              {strategyOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
