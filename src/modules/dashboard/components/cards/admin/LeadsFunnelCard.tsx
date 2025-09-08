/**
 * Leads Funnel Card for Admin Dashboard
 * Shows lead pipeline: incoming → distributed → answered → won/lost
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { supabase } from '@/lib/supabaseClient';

interface LeadsFunnelData {
  incoming: number;
  distributed: number;
  answered: number;
  won: number;
  lost: number;
  conversionRate: number;
  avgResponseTime: number; // in hours
}

export const LeadsFunnelCard: React.FC = () => {
  const { data, isLoading, error } = useDashboardData<LeadsFunnelData>({
    queryKey: ['leads-funnel', '24h'],
    fetcher: async () => {
      // Fetch leads data from last 24h
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: leads, error } = await supabase
        .from('leads')
        .select('*, lead_assignments(status, created_at)')
        .gte('created_at', yesterday.toISOString());

      if (error) throw error;

      const incoming = leads?.length || 0;
      const distributed = leads?.filter(lead => 
        lead.lead_assignments?.some((a: any) => a.status !== 'pending')
      ).length || 0;
      
      const answered = leads?.filter(lead =>
        lead.lead_assignments?.some((a: any) => ['contacted', 'won', 'lost'].includes(a.status))
      ).length || 0;
      
      const won = leads?.filter(lead =>
        lead.lead_assignments?.some((a: any) => a.status === 'won')
      ).length || 0;
      
      const lost = leads?.filter(lead =>
        lead.lead_assignments?.some((a: any) => a.status === 'lost')
      ).length || 0;

      const conversionRate = incoming > 0 ? (won / incoming) * 100 : 0;
      
      // Calculate average response time
      const responseTimes = leads?.map(lead => {
        const assignment = lead.lead_assignments?.[0];
        if (assignment && assignment.created_at) {
          const leadTime = new Date(lead.created_at).getTime();
          const assignmentTime = new Date(assignment.created_at).getTime();
          return (assignmentTime - leadTime) / (1000 * 60 * 60); // hours
        }
        return null;
      }).filter(time => time !== null) || [];

      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length
        : 0;

      return {
        incoming,
        distributed,
        answered,
        won,
        lost,
        conversionRate,
        avgResponseTime
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

  const getStageColor = (current: number, total: number) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <DashboardCard
      title="Leads Funnel (24h)"
      isLoading={isLoading}
      error={error}
      empty={!data}
      metric={data ? {
        label: 'Conversion Rate',
        value: data.conversionRate,
        format: 'percentage' as const,
        change: {
          value: 5.2,
          trend: 'up' as const,
          period: '24h'
        }
      } : undefined}
    >
      {data && (
        <div className="space-y-4">
          {/* Funnel stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Innkommende</span>
              </div>
              <Badge variant="outline">{data.incoming}</Badge>
            </div>

            <div className="flex items-center gap-2 pl-4">
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fordelt</span>
                <Badge variant="outline">{data.distributed}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4">
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Besvart</span>
                </div>
                <Badge variant="outline">{data.answered}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pl-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="text-xs text-muted-foreground">Vunnet</span>
                </div>
                <Badge variant="outline" className="text-xs">{data.won}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-muted-foreground">Tapt</span>
                </div>
                <Badge variant="outline" className="text-xs">{data.lost}</Badge>
              </div>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Avg. responstid</div>
                <div className="font-medium">
                  {data.avgResponseTime < 1 
                    ? `${Math.round(data.avgResponseTime * 60)}m`
                    : `${data.avgResponseTime.toFixed(1)}h`
                  }
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Svar-rate</div>
                <div className="font-medium">
                  {data.incoming > 0 ? ((data.answered / data.incoming) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};