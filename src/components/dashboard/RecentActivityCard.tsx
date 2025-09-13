import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Home, 
  MessageSquare, 
  FileText,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'property' | 'message' | 'document' | 'maintenance';
  title: string;
  description: string;
  timestamp: Date;
  href?: string;
  status?: 'new' | 'pending' | 'completed';
}

interface RecentActivityCardProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'property':
      return Home;
    case 'message':
      return MessageSquare;
    case 'document':
      return FileText;
    case 'maintenance':
      return Calendar;
    default:
      return Clock;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-700';
    case 'pending':
      return 'bg-orange-100 text-orange-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
  activities = [],
  isLoading = false 
}) => {
  // Mock data when no activities provided
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'property',
      title: 'Ny eiendom registrert',
      description: 'Leilighet på Grünerløkka lagt til',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      href: '/properties',
      status: 'new'
    },
    {
      id: '2',
      type: 'message',
      title: 'Melding mottatt',
      description: 'Nytt tilbud fra VVS-partner',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      href: '/leads?tab=messages',
      status: 'new'
    },
    {
      id: '3',
      type: 'document',
      title: 'Dokument lastet opp',
      description: 'Salgsoppgave.pdf lagret',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      href: '/properties?tab=documents',
      status: 'completed'
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'Vedlikeholdsoppgave',
      description: 'Rengjøring av ventilasjon planlagt',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      href: '/properties?tab=maintenance',
      status: 'pending'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Nå nettopp';
    if (diffInHours < 24) return `${diffInHours} timer siden`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'I går';
    if (diffInDays < 7) return `${diffInDays} dager siden`;
    
    return date.toLocaleDateString('nb-NO');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nylig aktivitet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
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
          <Clock className="w-5 h-5" />
          Nylig aktivitet
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-3">
            {displayActivities.slice(0, 4).map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-muted">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      {activity.status && (
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status === 'new' ? 'Ny' : 
                           activity.status === 'pending' ? 'Venter' : 'Fullført'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  
                  {activity.href && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={activity.href}>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Ingen nylig aktivitet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};