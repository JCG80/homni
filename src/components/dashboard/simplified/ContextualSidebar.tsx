import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Target, 
  HelpCircle, 
  TrendingUp,
  Clock,
  CheckSquare,
  ArrowRight,
  BookOpen,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  hasProperties: boolean;
  isNewUser: boolean;
}

interface ContextualSidebarProps {
  userStats: UserStats;
  performanceMetrics: any;
}

/**
 * Contextual sidebar with personalized tips, next steps, and help resources
 */
export const ContextualSidebar: React.FC<ContextualSidebarProps> = ({ 
  userStats, 
  performanceMetrics 
}) => {
  const navigate = useNavigate();

  const getPersonalizedTips = () => {
    const tips = [];

    if (userStats.isNewUser) {
      tips.push({
        title: 'Registrer din eiendom',
        description: 'Legg til eiendomsinformasjon for å få mer relevante tilbud',
        action: 'Legg til eiendom',
        onClick: () => navigate('/properties'),
        priority: 'high'
      });
    }

    if (userStats.totalRequests === 0) {
      tips.push({
        title: 'Send din første forespørsel',
        description: 'Få gratis pristilbud fra kvalifiserte tjenesteyterne',
        action: 'Opprett forespørsel',
        onClick: () => navigate('/'),
        priority: 'high'
      });
    }

    if (userStats.pendingRequests > 0) {
      tips.push({
        title: 'Følg opp ventende forespørsler',
        description: 'Du har svar som venter på din respons',
        action: 'Se forespørsler',
        onClick: () => navigate('/leads'),
        priority: 'medium'
      });
    }

    if (!userStats.hasProperties && userStats.totalRequests > 0) {
      tips.push({
        title: 'Optimaliser dine forespørsler',
        description: 'Registrer eiendommer for mer presise tilbud',
        action: 'Legg til eiendom',
        onClick: () => navigate('/properties'),
        priority: 'medium'
      });
    }

    // Default tips for all users
    tips.push({
      title: 'Komplett profilen din',
      description: 'En fullstendig profil gir bedre og mer relevante tilbud',
      action: 'Gå til profil',
      onClick: () => navigate('/profile'),
      priority: 'low'
    });

    return tips.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    }).slice(0, 3);
  };

  const getNextSteps = () => {
    if (userStats.isNewUser || userStats.totalRequests === 0) {
      return [
        { step: 'Send første forespørsel', completed: false },
        { step: 'Motta tilbud fra partnere', completed: false },
        { step: 'Velg beste tilbud', completed: false }
      ];
    }

    return [
      { step: 'Send forespørsel', completed: userStats.totalRequests > 0 },
      { step: 'Motta svar', completed: userStats.pendingRequests > 0 || userStats.completedRequests > 0 },
      { step: 'Velg tjenesteyteren', completed: userStats.completedRequests > 0 },
      { step: 'Fullfør prosjekt', completed: userStats.completedRequests > 0 }
    ];
  };

  const personalizedTips = getPersonalizedTips();
  const nextSteps = getNextSteps();

  return (
    <div className="space-y-6">
      
      {/* Personalized Tips */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Tips for deg
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {personalizedTips.map((tip, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tip.description}
                  </p>
                </div>
                {tip.priority === 'high' && (
                  <Badge variant="default" className="text-xs ml-2">
                    Viktig
                  </Badge>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs h-8"
                onClick={tip.onClick}
              >
                {tip.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-blue-500" />
            Din fremgang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.completed ? (
                  <CheckSquare className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.step}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            Hjelp & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-auto p-3 text-left"
            onClick={() => navigate('/help')}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Hvordan fungerer Homni?</div>
                <div className="text-xs text-muted-foreground">
                  Lær om vår tjeneste
                </div>
              </div>
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-auto p-3 text-left"
            onClick={() => navigate('/contact')}
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Kontakt support</div>
                <div className="text-xs text-muted-foreground">
                  Få hjelp fra teamet vårt
                </div>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Performance Metrics (Development only) */}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-3 h-3" />
              Ytelse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Cache størrelse:</span>
                <span>{performanceMetrics.cacheSize}MB</span>
              </div>
              <div className="flex justify-between">
                <span>Data cached:</span>
                <span>{performanceMetrics.isDataCached ? 'Ja' : 'Nei'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};