/**
 * Company Dashboard - Today's Leads Card
 * Shows new and unanswered leads for the company
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Lead } from '@/types/leads-consolidated';

export const TodayLeadsCard: React.FC = () => {
  const { profile } = useAuth();

  const { data: leads, isLoading, error, refetch } = useDashboardData<Lead[]>({
    queryKey: ['today-leads', profile?.company_id],
    fetcher: async () => {
      if (!profile?.company_id) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_assignments (
            id,
            status,
            assigned_at
          )
        `)
        .eq('company_id', profile.company_id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as Lead[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000 // 5 minutes
  });

  const handleTakeOwnership = async (leadId: string) => {
    // Placeholder for taking ownership action
    console.log('Taking ownership of lead:', leadId);
  };

  const getUrgencyColor = (createdAt: string) => {
    const hoursOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld > 24) return 'destructive';
    if (hoursOld > 12) return 'secondary';
    return 'default';
  };

  const newLeads = leads?.filter(lead => lead.status === 'new') || [];
  const totalLeads = leads?.length || 0;

  return (
    <DashboardCard
      title="Dagens Leads"
      isLoading={isLoading}
      error={error}
      empty={!totalLeads}
      emptyMessage="Ingen leads i dag"
      metric={{
        label: "Nye leads",
        value: newLeads.length,
        change: totalLeads > newLeads.length ? {
          value: totalLeads - newLeads.length,
          trend: 'neutral' as const,
          period: 'totalt'
        } : undefined
      }}
      actions={
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Oppdater
        </Button>
      }
    >
      <div className="space-y-3">
        {leads?.slice(0, 5).map((lead) => (
          <div key={lead.id} className="flex items-start justify-between p-3 border rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{lead.lead_type || 'Generell'}</Badge>
                <Badge variant="secondary">{lead.category}</Badge>
                {lead.status === 'new' && (
                  <Badge variant="default">Ny</Badge>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(lead.created_at), { 
                    addSuffix: true,
                    locale: nb 
                  })}
                </div>
              </div>

              <div className="text-sm line-clamp-2">
                {lead.description}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  {lead.customer_phone && (
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
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleTakeOwnership(lead.id)}
                    className="h-8"
                  >
                    Ta eierskap
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {leads && leads.length > 5 && (
          <Button variant="outline" size="sm" className="w-full">
            Se alle ({leads.length})
          </Button>
        )}
      </div>
    </DashboardCard>
  );
};