/**
 * Feature Flags Card for Master Admin Dashboard
 * Shows feature flag overview with toggle functionality and audit trail
 */

import React, { useState } from 'react';
import { DashboardCard } from '../../DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Flag, History, Eye } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: string[];
  created_at: string;
  updated_at: string;
}

export const FeatureFlagsCard: React.FC = () => {
  const [updatingFlags, setUpdatingFlags] = useState<Set<string>>(new Set());

  const { data: flags, isLoading, error, refetch } = useDashboardData<FeatureFlag[]>({
    queryKey: ['feature-flags-overview'],
    fetcher: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const handleToggleFlag = async (flagId: string, currentState: boolean) => {
    setUpdatingFlags(prev => new Set(prev).add(flagId));
    
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ 
          is_enabled: !currentState,
          updated_at: new Date().toISOString()
        })
        .eq('id', flagId);

      if (error) throw error;

      toast.success(`Feature flag ${!currentState ? 'enabled' : 'disabled'}`);
      refetch();
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast.error('Failed to update feature flag');
    } finally {
      setUpdatingFlags(prev => {
        const newSet = new Set(prev);
        newSet.delete(flagId);
        return newSet;
      });
    }
  };

  const enabledCount = flags?.filter(f => f.is_enabled).length || 0;
  const totalCount = flags?.length || 0;

  return (
    <DashboardCard
      title="Feature Flags"
      isLoading={isLoading}
      error={error}
      empty={!flags || flags.length === 0}
      emptyMessage="Ingen feature flags funnet"
      metric={{
        label: 'Active Flags',
        value: `${enabledCount}/${totalCount}`,
        change: {
          value: 12,
          trend: 'up' as const,
          period: '7d'
        }
      }}
      actions={
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Audit Trail
        </Button>
      }
    >
      {flags && (
        <div className="space-y-3">
          {flags.slice(0, 6).map((flag) => (
            <div key={flag.id} className="flex items-center justify-between space-x-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Flag className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {flag.name}
                  </span>
                  {flag.rollout_percentage < 100 && (
                    <Badge variant="secondary" className="text-xs">
                      {flag.rollout_percentage}%
                    </Badge>
                  )}
                </div>
                {flag.description && (
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {flag.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={() => handleToggleFlag(flag.id, flag.is_enabled)}
                  disabled={updatingFlags.has(flag.id)}
                />
              </div>
            </div>
          ))}
          
          {totalCount > 6 && (
            <div className="pt-2 border-t">
              <Button variant="ghost" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Se alle {totalCount} flags
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};