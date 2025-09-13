import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Home, 
  MessageSquare, 
  RefreshCw,
  Settings,
  HelpCircle,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  hasProperties: boolean;
  isNewUser: boolean;
}

interface SmartQuickActionsProps {
  userStats: UserStats;
  onRefresh: () => void;
}

/**
 * Context-aware quick actions based on user's current state
 */
export const SmartQuickActions: React.FC<SmartQuickActionsProps> = ({ 
  userStats, 
  onRefresh 
}) => {
  const navigate = useNavigate();

  const getSmartActions = () => {
    const actions = [];

    // Primary actions based on user state
    if (userStats.isNewUser || userStats.totalRequests === 0) {
      actions.push({
        title: 'Send første forespørsel',
        description: 'Start med å sende din første forespørsel',
        icon: Plus,
        onClick: () => navigate('/'),
        variant: 'default' as const,
        priority: 'high' as const
      });
    } else {
      actions.push({
        title: 'Ny forespørsel',
        description: 'Send en ny tjeneste forespørsel',
        icon: Plus,
        onClick: () => navigate('/'),
        variant: 'default' as const,
        priority: 'high' as const
      });
    }

    // Property management
    if (!userStats.hasProperties) {
      actions.push({
        title: 'Registrer eiendom',
        description: 'Legg til din første eiendom',
        icon: Home,
        onClick: () => navigate('/properties'),
        variant: 'outline' as const,
        priority: 'medium' as const,
        badge: 'Anbefalt'
      });
    } else {
      actions.push({
        title: 'Mine eiendommer',
        description: 'Administrer dine eiendommer',
        icon: Home,
        onClick: () => navigate('/properties'),
        variant: 'outline' as const,
        priority: 'low' as const
      });
    }

    // Request management
    if (userStats.pendingRequests > 0) {
      actions.push({
        title: 'Ventende svar',
        description: `${userStats.pendingRequests} forespørsler venter`,
        icon: Clock,
        onClick: () => navigate('/leads'),
        variant: 'outline' as const,
        priority: 'high' as const,
        badge: `${userStats.pendingRequests}`
      });
    }

    if (userStats.totalRequests > 0) {
      actions.push({
        title: 'Mine forespørsler',
        description: 'Se alle dine forespørsler',
        icon: MessageSquare,
        onClick: () => navigate('/leads'),
        variant: 'ghost' as const,
        priority: 'low' as const
      });
    }

    // Always available actions
    actions.push(
      {
        title: 'Innstillinger',
        description: 'Administrer din profil',
        icon: Settings,
        onClick: () => navigate('/settings'),
        variant: 'ghost' as const,
        priority: 'low' as const
      },
      {
        title: 'Hjelp & Support',
        description: 'Få hjelp med Homni',
        icon: HelpCircle,
        onClick: () => navigate('/help'),
        variant: 'ghost' as const,
        priority: 'low' as const
      }
    );

    // Sort by priority
    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const actions = getSmartActions();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Hurtighandlinger</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={action.title}
            variant={action.variant}
            className="w-full justify-start h-auto p-4 text-left"
            onClick={action.onClick}
          >
            <div className="flex items-center gap-3 w-full">
              <action.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{action.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                    <ArrowRight className="w-3 h-3 opacity-50" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};