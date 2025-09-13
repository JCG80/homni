import React from 'react';
import { useMyLeads } from '../hooks/useMyLeads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, ArrowRight, Loader2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

export const MyRequestsWidget: React.FC = () => {
  const { leads, isLoading, error } = useMyLeads();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Laster forespørsler...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Kunne ikke laste forespørsler</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Prøv igjen
        </Button>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">Ingen forespørsler ennå</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Send din første forespørsel for tjenester
        </p>
        <Button onClick={() => navigate('/requests/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Send forespørsel
        </Button>
      </div>
    );
  }

  // Show top 3 recent leads
  const displayLeads = leads.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'qualified':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'contacted':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'negotiating':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'converted':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'lost':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'Ny';
      case 'qualified': return 'Kvalifisert';
      case 'contacted': return 'Kontaktet';
      case 'negotiating': return 'Forhandling';
      case 'converted': return 'Fullført';
      case 'lost': return 'Tapt';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Totalt</p>
          <p className="text-lg font-semibold">{leads.length}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Aktive</p>
          <p className="text-lg font-semibold">
            {leads.filter(lead => 
              ['new', 'qualified', 'contacted', 'negotiating'].includes(lead.status.toLowerCase())
            ).length}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Fullført</p>
          <p className="text-lg font-semibold">
            {leads.filter(lead => lead.status.toLowerCase() === 'converted').length}
          </p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="space-y-3">
        {displayLeads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/requests/${lead.id}`)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{lead.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(lead.status)}`}
                  >
                    {getStatusText(lead.status)}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(lead.created_at), { 
                      addSuffix: true, 
                      locale: nb 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/requests')}
          className="w-full flex items-center gap-2"
        >
          Se alle forespørsler
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};