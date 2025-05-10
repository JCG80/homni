
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeadSettingsForm } from '../hooks/useLeadSettingsForm';
import { StrategySelector } from './settings/StrategySelector';
import { BudgetInputs } from './settings/BudgetInputs';
import { DistributionToggles } from './settings/DistributionToggles';
import { LoadingStates } from './settings/LoadingStates';

export const LeadSettingsForm = () => {
  const {
    loading,
    error,
    saving,
    strategy,
    dailyBudget,
    monthlyBudget,
    paused,
    agentsPaused,
    setStrategy,
    setDailyBudget,
    setMonthlyBudget,
    setPaused,
    setAgentsPaused,
    handleSave,
    loadSettings
  } = useLeadSettingsForm();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lead Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingStates 
          loading={loading} 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
        
        {!loading && !error && (
          <div className="space-y-4">
            <StrategySelector 
              strategy={strategy} 
              onChange={setStrategy} 
            />
            
            <BudgetInputs 
              dailyBudget={dailyBudget}
              monthlyBudget={monthlyBudget}
              onDailyBudgetChange={setDailyBudget}
              onMonthlyBudgetChange={setMonthlyBudget}
            />
            
            <DistributionToggles 
              pauseState={paused}
              agentsPausedState={agentsPaused}
              onPauseChange={() => setPaused(!paused)}
              onAgentsPausedChange={() => setAgentsPaused(!agentsPaused)}
            />
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="mt-4"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
