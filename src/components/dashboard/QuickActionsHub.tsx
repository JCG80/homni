import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Home, 
  FileText, 
  Mail, 
  Calendar, 
  Search,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export const QuickActionsHub: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useIntegratedAuth();

  const quickActions: QuickAction[] = [
    {
      id: 'new-request',
      title: 'Ny forespørsel',
      description: 'Send en ny serviceforespørsel',
      icon: Plus,
      onClick: () => navigate('/'),
      variant: 'default',
    },
    {
      id: 'add-property',
      title: 'Registrer eiendom',
      description: 'Legg til din eiendom',
      icon: Home,
      onClick: () => navigate('/property'),
      variant: 'outline',
    },
    {
      id: 'upload-document',
      title: 'Last opp dokument',
      description: 'Legg til dokumenter til eiendommen',
      icon: FileText,
      onClick: () => navigate('/property?tab=documents'),
      variant: 'outline',
    },
    {
      id: 'view-leads',
      title: 'Mine forespørsler',
      description: 'Se status på dine forespørsler',
      icon: Mail,
      onClick: () => navigate('/leads'),
      badge: 'Ny',
      variant: 'outline',
    },
    {
      id: 'maintenance',
      title: 'Vedlikehold',
      description: 'Planlegg vedlikeholdsoppgaver',
      icon: Calendar,
      onClick: () => navigate('/property?tab=maintenance'),
      variant: 'outline',
    },
    {
      id: 'search',
      title: 'Søk tjenester',
      description: 'Finn relevante tjenesteleverandører',
      icon: Search,
      onClick: () => navigate('/search'),
      variant: 'outline',
    },
  ];

  // Add admin actions if user has admin role
  if (role === 'admin' || role === 'master_admin') {
    quickActions.push(
      {
        id: 'analytics',
        title: 'Analyser',
        description: 'Se detaljert statistikk',
        icon: BarChart3,
        onClick: () => navigate('/admin/analytics'),
        variant: 'secondary',
      },
      {
        id: 'settings',
        title: 'Innstillinger',
        description: 'Administrer system',
        icon: Settings,
        onClick: () => navigate('/admin/settings'),
        variant: 'secondary',
      }
    );
  }

  const handleAction = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Hurtighandlinger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center"
                onClick={() => handleAction(action)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};