
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DistributionStrategy } from '../strategies/strategyFactory';
import { getCurrentStrategy } from '../utils/leadDistributor';
import { loadSettings } from '../utils/loadSettings';
import { LeadsTabs } from '../components/LeadsTabs';
import { LeadDistributionPanel } from '../components/admin/LeadDistributionPanel';

export const AdminLeadsPage = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [currentStrategy, setCurrentStrategy] = useState<DistributionStrategy | null>(null);
  const [strategyFetching, setStrategyFetching] = useState(true);
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [globalPause, setGlobalPause] = useState(false);
  const [autoDistribute, setAutoDistribute] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Fetch current strategy and settings on mount
  useEffect(() => {
    const fetchStrategyAndSettings = async () => {
      setStrategyFetching(true);
      setSettingsLoading(true);
      try {
        const strategy = await getCurrentStrategy();
        setCurrentStrategy(strategy);
        
        const settings = await loadSettings();
        if (settings) {
          setDailyBudget(settings.daily_budget?.toString() || '');
          setMonthlyBudget(settings.monthly_budget?.toString() || '');
          setGlobalPause(settings.global_pause);
          setAutoDistribute(settings.auto_distribute || false);
        }
      } catch (error) {
        console.error('Error fetching strategy or settings:', error);
      } finally {
        setStrategyFetching(false);
        setSettingsLoading(false);
      }
    };

    fetchStrategyAndSettings();
  }, []);

  if (authLoading) {
    return <div>Laster inn...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  const settings = {
    dailyBudget,
    monthlyBudget,
    globalPause,
    autoDistribute
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administrer leads</h1>
      </div>
      
      <LeadDistributionPanel
        currentStrategy={currentStrategy}
        setCurrentStrategy={setCurrentStrategy}
        settings={settings}
        isLoading={settingsLoading || strategyFetching}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Leads</h2>
        <LeadsTabs />
      </div>
    </div>
  );
};
