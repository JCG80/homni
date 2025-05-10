
import { DistributionStrategy } from '../../strategies/strategyFactory';
import { DistributionStrategySelector } from './DistributionStrategySelector';
import { ManualDistributionButton } from './ManualDistributionButton';
import { LeadSettingsForm } from './LeadSettingsForm';

interface LeadDistributionPanelProps {
  currentStrategy: DistributionStrategy | null;
  setCurrentStrategy: (strategy: DistributionStrategy) => void;
  settings: {
    dailyBudget: string;
    monthlyBudget: string;
    globalPause: boolean;
    autoDistribute: boolean;
  };
  isLoading: boolean;
}

export const LeadDistributionPanel = ({
  currentStrategy,
  setCurrentStrategy,
  settings,
  isLoading
}: LeadDistributionPanelProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Lead distribusjon</h2>
      
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <DistributionStrategySelector 
          currentStrategy={currentStrategy} 
          onStrategyChange={setCurrentStrategy} 
        />
        
        <ManualDistributionButton strategy={currentStrategy} />
      </div>
      
      <LeadSettingsForm 
        initialSettings={settings}
        currentStrategy={currentStrategy}
        isLoading={isLoading}
      />
    </div>
  );
};
