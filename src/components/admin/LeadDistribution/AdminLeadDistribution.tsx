import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Pause, TestTube, BarChart3 } from 'lucide-react';
import { DistributionStrategy, DISTRIBUTION_STRATEGIES } from '@/modules/leads/strategies/strategyFactory';
import { processUnassignedLeads } from '@/modules/leads/utils/processLeads';
import { updateLeadSettings, fetchLeadSettings } from '@/modules/leads/api/leadSettings';
import { updateDistributionStrategy, getCurrentStrategy } from '@/modules/leads/utils/getCurrentStrategy';
import { logger } from '@/utils/logger';

interface AdminLeadDistributionProps {
  className?: string;
}

export const AdminLeadDistribution: React.FC<AdminLeadDistributionProps> = ({ className }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<DistributionStrategy>('roundRobin');
  const [isPaused, setIsPaused] = useState(false);
  const [dailyBudget, setDailyBudget] = useState<string>('');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [testCategory, setTestCategory] = useState('');
  const [lastProcessResult, setLastProcessResult] = useState<number | null>(null);

  // Load current settings
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Load current strategy
        const currentStrategy = await getCurrentStrategy();
        setSelectedStrategy(currentStrategy);
        
        // Load current settings
        const settings = await fetchLeadSettings();
        if (settings) {
          setIsPaused(settings.paused || false);
          setDailyBudget(settings.daily_budget?.toString() || '');
          setMonthlyBudget(settings.monthly_budget?.toString() || '');
        }
      } catch (error) {
        logger.error('Error loading settings:', {}, error);
        toast({
          title: 'Error loading settings',
          description: 'Failed to load current lead distribution settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);

  const handleSaveStrategy = async () => {
    try {
      setIsLoading(true);
      
      const success = await updateDistributionStrategy(selectedStrategy);
      
      if (success) {
        toast({
          title: 'Strategy updated',
          description: `Distribution strategy set to ${selectedStrategy}`,
        });
      } else {
        throw new Error('Failed to update strategy');
      }
    } catch (error) {
      logger.error('Error saving strategy:', {}, error);
      toast({
        title: 'Error',
        description: 'Failed to update distribution strategy',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      await updateLeadSettings({
        globally_paused: isPaused,
        daily_budget: dailyBudget ? parseFloat(dailyBudget) : null,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
      });
      
      toast({
        title: 'Settings saved',
        description: 'Lead distribution settings have been updated',
      });
    } catch (error) {
      logger.error('Error saving settings:', {}, error);
      toast({
        title: 'Error',
        description: 'Failed to save lead distribution settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDistribution = async () => {
    try {
      setIsLoading(true);
      
      const processedCount = await processUnassignedLeads(selectedStrategy, {
        leadType: 'general',
        showToasts: false,
      });
      
      setLastProcessResult(processedCount);
      
      toast({
        title: 'Test completed',
        description: `Processed ${processedCount} unassigned leads`,
      });
    } catch (error) {
      logger.error('Error testing distribution:', {}, error);
      toast({
        title: 'Test failed',
        description: 'Failed to test lead distribution',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAll = async () => {
    try {
      setIsLoading(true);
      
      const processedCount = await processUnassignedLeads(selectedStrategy, {
        showToasts: true,
      });
      
      setLastProcessResult(processedCount);
    } catch (error) {
      logger.error('Error processing leads:', {}, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !selectedStrategy) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading lead distribution settings...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Lead Distribution Management</h1>
        <p className="text-muted-foreground">
          Configure how leads are automatically distributed to companies
        </p>
      </div>

      {/* Strategy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Strategy</CardTitle>
          <CardDescription>
            Choose how leads should be assigned to companies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select
              value={selectedStrategy}
              onValueChange={(value) => setSelectedStrategy(value as DistributionStrategy)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distribution strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roundRobin">
                  Round Robin - Distribute leads evenly across companies
                </SelectItem>
                <SelectItem value="category_match">
                  Category Match - Match leads to companies by expertise
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleSaveStrategy} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Strategy
            </Button>
            <Badge variant="outline">{selectedStrategy}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
          <CardDescription>
            Pause/resume lead distribution and set budget limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pause-switch">System Status</Label>
              <p className="text-sm text-muted-foreground">
                {isPaused ? 'Distribution is paused' : 'Distribution is active'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <Switch
                id="pause-switch"
                checked={!isPaused}
                onCheckedChange={(checked) => setIsPaused(!checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-budget">Daily Budget Limit</Label>
              <Input
                id="daily-budget"
                type="number"
                placeholder="1000"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-budget">Monthly Budget Limit</Label>
              <Input
                id="monthly-budget"
                type="number"
                placeholder="30000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Testing & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing & Manual Actions</CardTitle>
          <CardDescription>
            Test the distribution system and manually process leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedStrategy === 'category_match' && (
            <div className="space-y-2">
              <Label htmlFor="test-category">Test Category</Label>
              <Input
                id="test-category"
                placeholder="e.g., insurance, financing, renovation"
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTestDistribution}
              disabled={isLoading}
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Distribution
            </Button>
            
            <Button
              onClick={handleProcessAll}
              disabled={isLoading || isPaused}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Process All Unassigned
            </Button>
            
            <Button variant="outline" disabled>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>

          {lastProcessResult !== null && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Last Processing Result</h4>
              <p className="text-sm text-muted-foreground">
                Processed {lastProcessResult} leads using {selectedStrategy} strategy
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};