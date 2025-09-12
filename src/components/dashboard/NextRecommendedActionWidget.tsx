import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { 
  ArrowRight, 
  Plus, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface RecommendedAction {
  id: string;
  type: 'create_lead' | 'follow_up' | 'complete_profile' | 'view_offers' | 'contact_support';
  title: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
  urgent?: boolean;
}

export const NextRecommendedActionWidget = () => {
  const { user, profile } = useAuth();
  const [recommendedActions, setRecommendedActions] = useState<RecommendedAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateRecommendedActions();
    }
  }, [user, profile]);

  const generateRecommendedActions = async () => {
    try {
      const actions: RecommendedAction[] = [];

      // Check user's leads and profile completeness
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .or(`submitted_by.eq.${user!.id},and(anonymous_email.eq.${user!.email},submitted_by.is.null)`)
        .order('created_at', { ascending: false });

      const totalLeads = leads?.length || 0;
      const pendingLeads = leads?.filter(l => l.status === 'new' || l.status === 'qualified').length || 0;
      const contactedLeads = leads?.filter(l => l.status === 'contacted').length || 0;
      const negotiatingLeads = leads?.filter(l => l.status === 'negotiating').length || 0;

      // Priority 1: Follow up on negotiating leads
      if (negotiatingLeads > 0) {
        actions.push({
          id: 'follow_up_negotiating',
          type: 'follow_up',
          title: 'Følg opp forhandlinger',
          description: `Du har ${negotiatingLeads} forespørsel${negotiatingLeads > 1 ? 'er' : ''} under forhandling. Følg opp for å få beste tilbud.`,
          buttonText: 'Se forhandlinger',
          buttonAction: () => window.location.href = '/leads?status=negotiating',
          icon: TrendingUp,
          priority: 'high',
          urgent: true
        });
      }

      // Priority 2: Check contacted leads
      if (contactedLeads > 0) {
        actions.push({
          id: 'check_contacted',
          type: 'view_offers',
          title: 'Sjekk nye tilbud',
          description: `${contactedLeads} leverandør${contactedLeads > 1 ? 'er' : ''} har kontaktet deg. Sammenlign tilbudene deres.`,
          buttonText: 'Se tilbud',
          buttonAction: () => window.location.href = '/leads?status=contacted',
          icon: MessageSquare,
          priority: 'high'
        });
      }

      // Priority 3: Follow up pending leads
      if (pendingLeads > 0) {
        const oldestPending = leads?.filter(l => l.status === 'new' || l.status === 'qualified')
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
        
        if (oldestPending) {
          const daysSinceCreated = Math.floor(
            (Date.now() - new Date(oldestPending.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceCreated >= 3) {
            actions.push({
              id: 'follow_up_pending',
              type: 'follow_up',
              title: 'Følg opp ventende forespørsler',
              description: `${pendingLeads} forespørsel${pendingLeads > 1 ? 'er' : ''} venter fortsatt på svar. Kontakt oss hvis du trenger hjelp.`,
              buttonText: 'Kontakt support',
              buttonAction: () => window.location.href = '/support',
              icon: Clock,
              priority: 'medium',
              urgent: daysSinceCreated >= 7
            });
          }
        }
      }

      // Priority 4: Complete profile if incomplete
      const isProfileIncomplete = !profile?.full_name || 
        !profile?.phone || 
        !profile?.metadata || 
        Object.keys(profile.metadata).length < 3;

      if (isProfileIncomplete) {
        actions.push({
          id: 'complete_profile',
          type: 'complete_profile',
          title: 'Fullfør profilen din',
          description: 'En komplett profil gir deg bedre tilbud og raskere svar fra leverandører.',
          buttonText: 'Oppdater profil',
          buttonAction: () => window.location.href = '/profile',
          icon: FileText,
          priority: 'medium'
        });
      }

      // Priority 5: Create new lead if no recent activity
      if (totalLeads === 0) {
        actions.push({
          id: 'create_first_lead',
          type: 'create_lead',
          title: 'Send din første forespørsel',
          description: 'Få tilbud på tjenester du trenger - helt gratis og uforpliktende.',
          buttonText: 'Start her',
          buttonAction: () => window.location.href = '/',
          icon: Plus,
          priority: 'high'
        });
      } else {
        const lastLeadDate = leads?.[0]?.created_at;
        if (lastLeadDate) {
          const daysSinceLastLead = Math.floor(
            (Date.now() - new Date(lastLeadDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLastLead >= 30) {
            actions.push({
              id: 'create_new_lead',
              type: 'create_lead',
              title: 'Trenger du noen nye tjenester?',
              description: 'Det er en stund siden din siste forespørsel. Se om vi kan hjelpe deg igjen.',
              buttonText: 'Send ny forespørsel',
              buttonAction: () => window.location.href = '/',
              icon: Plus,
              priority: 'low'
            });
          }
        }
      }

      // Sort by priority and urgency
      const sortedActions = actions.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setRecommendedActions(sortedActions.slice(0, 3)); // Show max 3 actions
    } catch (error) {
      logger.error('Error generating recommended actions:', {}, error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: RecommendedAction['priority'], urgent?: boolean) => {
    if (urgent) return 'bg-red-100 text-red-800 border-red-200';
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendedActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Alt ser bra ut!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Du har ingen åpne oppgaver for øyeblikket. Bra jobbet!
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Plus className="w-4 h-4 mr-2" />
            Send ny forespørsel
          </Button>
        </CardContent>
      </Card>
    );
  }

  const topAction = recommendedActions[0];
  const Icon = topAction.icon;

  return (
    <Card className={topAction.urgent ? 'border-red-200 bg-red-50/50' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Anbefalt handling
          </span>
          {topAction.urgent && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              Haster
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{topAction.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{topAction.description}</p>
            <Button onClick={topAction.buttonAction} className="w-full sm:w-auto">
              {topAction.buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {recommendedActions.length > 1 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Andre oppgaver:</p>
            <div className="space-y-2">
              {recommendedActions.slice(1).map((action) => {
                const ActionIcon = action.icon;
                return (
                  <div key={action.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ActionIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{action.title}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(action.priority, action.urgent)} text-xs`}
                    >
                      {action.urgent ? 'Haster' : 
                       action.priority === 'high' ? 'Viktig' : 
                       action.priority === 'medium' ? 'Medium' : 'Lav'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};