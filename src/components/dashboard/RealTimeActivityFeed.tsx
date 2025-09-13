import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Bell, Home, MessageSquare, Wrench, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

interface ActivityItem {
  id: string;
  type: 'lead' | 'property' | 'maintenance' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  metadata?: any;
}

export const RealTimeActivityFeed: React.FC = () => {
  const { user } = useIntegratedAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      try {
        // Fetch recent leads
        const { data: leads } = await supabase
          .from('leads')
          .select('id, title, description, status, created_at, metadata')
          .eq('submitted_by', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent property updates
        const { data: properties } = await supabase
          .from('properties')
          .select('id, name, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3);

        const activityItems: ActivityItem[] = [];

        // Add lead activities
        leads?.forEach(lead => {
          activityItems.push({
            id: `lead-${lead.id}`,
            type: 'lead',
            title: `Forespørsel: ${lead.title}`,
            description: `Status: ${lead.status}`,
            timestamp: lead.created_at,
            status: lead.status,
            metadata: lead.metadata
          });
        });

        // Add property activities
        properties?.forEach(property => {
          const isNew = new Date(property.created_at).getTime() === new Date(property.updated_at).getTime();
          activityItems.push({
            id: `property-${property.id}`,
            type: 'property',
            title: isNew ? `Ny eiendom: ${property.name}` : `Oppdatert: ${property.name}`,
            description: isNew ? 'Eiendom registrert' : 'Eiendom oppdatert',
            timestamp: property.updated_at,
          });
        });

        // Sort by timestamp
        activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setActivities(activityItems);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription for leads
    const leadsSubscription = supabase
      .channel('user-leads')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads',
          filter: `submitted_by=eq.${user.id}`
        }, 
        () => {
          fetchActivities(); // Refresh activities on change
        }
      )
      .subscribe();

    // Set up real-time subscription for properties
    const propertiesSubscription = supabase
      .channel('user-properties')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'properties',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchActivities(); // Refresh activities on change
        }
      )
      .subscribe();

    return () => {
      leadsSubscription.unsubscribe();
      propertiesSubscription.unsubscribe();
    };
  }, [user?.id]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead':
        return <MessageSquare className="h-4 w-4" />;
      case 'property':
        return <Home className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'system':
        return <Bell className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (type === 'lead') {
      switch (status) {
        case 'new':
          return 'bg-blue-100 text-blue-800';
        case 'contacted':
          return 'bg-green-100 text-green-800';
        case 'converted':
          return 'bg-emerald-100 text-emerald-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Siste aktivitet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Siste aktivitet
          <Badge variant="secondary" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ingen aktivitet ennå</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      {activity.status && (
                        <Badge className={`${getActivityColor(activity.type, activity.status)} text-xs`}>
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm', { locale: nb })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};