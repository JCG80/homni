/**
 * Admin Dashboard - Queue Control Card
 * Manages lead distribution and queue operations
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface QueueStats {
  pending_assignments: number;
  paused_companies: number;
  failed_assignments: number;
  avg_assignment_time: number;
  global_pause: boolean;
}

export const QueueControlCard: React.FC = () => {
  const { data: queueStats, isLoading, error, refetch } = useDashboardData<QueueStats>({
    queryKey: ['queue-control'],
    fetcher: async () => {
      // Mock data - replace with actual queue stats query
      const mockStats: QueueStats = {
        pending_assignments: 12,
        paused_companies: 3,
        failed_assignments: 2,
        avg_assignment_time: 45,
        global_pause: false
      };

      // In real implementation, query lead_assignments and lead_settings
      const { data: settings } = await supabase
        .from('lead_settings')
        .select('global_pause, agents_paused')
        .limit(1)
        .single();

      return {
        ...mockStats,
        global_pause: settings?.global_pause || false
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000
  });

  const handleGlobalPause = async (paused: boolean) => {
    try {
      const { error } = await supabase
        .from('lead_settings')
        .update({ global_pause: paused })
        .eq('id', 'global'); // Assuming global settings row

      if (error) throw error;
      refetch();
    } catch (err) {
      logger.error('Failed to update global pause:', {
        module: 'QueueControlCard',
        action: 'handleGlobalPause',
        paused
      }, err as Error);
    }
  };

  const handleReassignFailed = async () => {
    // Mock action - in real implementation, trigger reassignment
    logger.info('Reassigning failed assignments...', {
      module: 'QueueControlCard',
      action: 'handleReassignFailed'
    });
    refetch();
  };

  return (
    <DashboardCard
      title="Kø-kontroll"
      isLoading={isLoading}
      error={error}
      metric={{
        label: "Ventende tildeling",
        value: queueStats?.pending_assignments || 0,
        change: queueStats?.failed_assignments ? {
          value: queueStats.failed_assignments,
          trend: 'down' as const,
          period: 'feilede'
        } : undefined
      }}
      actions={
        <div className="flex items-center gap-2">
          <Switch
            checked={queueStats?.global_pause}
            onCheckedChange={handleGlobalPause}
          />
          <span className="text-sm">Global pause</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Queue Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aktive selskaper</span>
              <Badge variant="outline">
                {queueStats ? (20 - queueStats.paused_companies) : 0}
              </Badge>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pausete selskaper</span>
              <Badge variant="destructive">
                {queueStats?.paused_companies || 0}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Gjennomsnittlig tildelingstid</span>
            <span className="text-sm">{queueStats?.avg_assignment_time || 0}s</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.min((queueStats?.avg_assignment_time || 0) / 120 * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Failed Assignments Alert */}
        {queueStats?.failed_assignments && queueStats.failed_assignments > 0 && (
          <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm">
                  {queueStats.failed_assignments} feilede tildelinger
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReassignFailed}
                className="h-8"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Tildel på nytt
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            Start alle
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Pause className="w-3 h-3 mr-1" />
            Pause alle
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
};