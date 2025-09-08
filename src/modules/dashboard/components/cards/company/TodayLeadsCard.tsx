/**
 * Today's Leads Card for Company Dashboard
 * Shows new and unanswered leads for the current company
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Lead {
  id: string;
  lead_type: string;
  description: string;
  created_at: string;
  status: 'new' | 'assigned' | 'contacted' | 'won' | 'lost';
  category: string;
}

export const TodayLeadsCard: React.FC = () => {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const { data: leads, isLoading, error, refetch } = useDashboardData<Lead[]>({
    queryKey: ['company-leads-today', companyId],
    fetcher: async () => {
      if (!companyId) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_assignments(
            status,
            created_at
          )
        `)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(lead => ({
        id: lead.id,
        lead_type: lead.lead_type,
        description: lead.description,
        created_at: lead.created_at,
        status: (lead.lead_assignments?.[0]?.status || 'new') as 'new' | 'assigned' | 'contacted' | 'won' | 'lost',
        category: lead.category
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });

  const handleTakeOwnership = async (leadId: string) => {
    // TODO: Implement take ownership functionality
    console.log('Taking ownership of lead:', leadId);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const newLeads = leads?.filter(lead => lead.status === 'new') || [];
  const totalLeads = leads?.length || 0;

  return (
    <DashboardCard
      title="Dagens Leads"
      isLoading={isLoading}
      error={error}
      empty={totalLeads === 0}
      emptyMessage="Ingen nye leads i dag"
      metric={{
        label: 'Nye leads',
        value: newLeads.length,
        change: newLeads.length > 0 ? {
          value: 25,
          trend: 'up' as const,
          period: 'i går'
        } : undefined
      }}
      actions={
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
        >
          Oppdater
        </Button>
      }
    >
      {leads && (
        <div className="space-y-3">
          {leads.slice(0, 5).map((lead) => (
            <div key={lead.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.lead_type}</span>
                    <Badge variant="secondary">
                      {lead.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatDistanceToNow(new Date(lead.created_at), { 
                    addSuffix: true,
                    locale: nb 
                  })}
                </div>
              </div>

              {lead.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {lead.location}
                </div>
              )}

              <div className="text-sm line-clamp-2">
                {lead.description}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  {lead.phone && (
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Phone className="w-3 h-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Mail className="w-3 h-3" />
                  </Button>
                </div>
                {lead.status === 'new' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleTakeOwnership(lead.id)}
                  >
                    Ta eierskap
                  </Button>
                )}
              </div>
            </div>
          ))}

          {totalLeads > 5 && (
            <div className="pt-2 text-center">
              <Button variant="ghost" size="sm">
                Se alle {totalLeads} leads
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};