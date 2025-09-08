/**
 * My Requests Card for User Dashboard
 * Shows user's requests with status and responses
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface UserRequest {
  id: string;
  service_type: string;
  description: string;
  status: 'pending' | 'matched' | 'responded' | 'completed' | 'cancelled';
  created_at: string;
  responses_count: number;
  latest_response?: string;
  budget_range?: string;
}

export const MyRequestsCard: React.FC = () => {
  const { user } = useAuth();

  const { data: requests, isLoading, error } = useDashboardData<UserRequest[]>({
    queryKey: ['user-requests', user?.id],
    fetcher: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          lead_type,
          description,
          created_at,
          category,
          lead_assignments(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(request => ({
        id: request.id,
        service_type: request.lead_type,
        description: request.description,
        status: 'pending' as const,
        created_at: request.created_at,
        budget_range: request.category,
        responses_count: request.lead_assignments?.length || 0,
        latest_response: request.lead_assignments?.[0]?.created_at
      }));
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Venter
          </Badge>
        );
      case 'matched':
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Matchet
          </Badge>
        );
      case 'responded':
        return (
          <Badge variant="default">
            <MessageSquare className="w-3 h-3 mr-1" />
            Svar mottatt
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Fullført
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            Kansellert
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeRequests = requests?.filter(r => 
    !['completed', 'cancelled'].includes(r.status)
  ) || [];
  const totalResponses = requests?.reduce((sum, r) => sum + r.responses_count, 0) || 0;

  return (
    <DashboardCard
      title="Mine Forespørsler"
      isLoading={isLoading}
      error={error}
      empty={!requests || requests.length === 0}
      emptyMessage="Du har ikke sendt noen forespørsler ennå"
      emptyAction={
        <Button>
          Send ny forespørsel
        </Button>
      }
      metric={requests ? {
        label: 'Aktive forespørsler',
        value: activeRequests.length,
        change: totalResponses > 0 ? {
          value: totalResponses,
          trend: 'neutral' as const,
          period: 'svar totalt'
        } : undefined
      } : undefined}
    >
      {requests && (
        <div className="space-y-3">
          {requests.slice(0, 4).map((request) => (
            <div key={request.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{request.service_type}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {request.description}
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDistanceToNow(new Date(request.created_at), { 
                      addSuffix: true,
                      locale: nb 
                    })}
                  </span>
                  {request.budget_range && (
                    <span>Budsjett: {request.budget_range}</span>
                  )}
                </div>
                {request.responses_count > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {request.responses_count} svar
                  </div>
                )}
              </div>

              {request.status === 'responded' && (
                <div className="pt-2">
                  <Button size="sm" className="w-full">
                    Se svar
                  </Button>
                </div>
              )}
            </div>
          ))}

          {(requests?.length || 0) > 4 && (
            <div className="pt-2 text-center">
              <Button variant="ghost" size="sm">
                Se alle forespørsler
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};