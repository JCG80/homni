import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb,
  ArrowRight,
  Eye,
  ThumbsUp,
  X,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface UserInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  data: any;
  confidence_score: number;
  is_active: boolean;
  viewed_at: string | null;
  acted_on_at: string | null;
  created_at: string;
  expires_at: string;
}

interface PersonalizedInsightsProps {
  userId: string;
  userStats: {
    totalRequests: number;
    completedRequests: number;
    hasProperties: boolean;
    daysActive: number;
  };
  onInsightAction?: (insight: UserInsight, action: string) => void;
}

/**
 * AI-driven personalized insights and recommendations
 */
export const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({
  userId,
  userStats,
  onInsightAction
}) => {
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<UserInsight | null>(null);

  useEffect(() => {
    loadPersonalizedInsights();
    generateNewInsights();
  }, [userId, userStats]);

  const loadPersonalizedInsights = async () => {
    try {
      const { data } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(6);

      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    // Generate AI-driven insights based on user behavior and stats
    const newInsights = [];

    // Recommendation: Send more requests
    if (userStats.totalRequests < 3) {
      newInsights.push({
        user_id: userId,
        insight_type: 'recommendation',
        title: 'Øk sjansene dine for suksess',
        description: 'Brukere som sender 3+ forespørsler får 67% flere svar. Send flere forespørsler for bedre resultater.',
        data: { 
          current: userStats.totalRequests,
          target: 3,
          improvement: '67%'
        },
        confidence_score: 0.85
      });
    }

    // Trend: Completion rate analysis
    if (userStats.totalRequests > 0) {
      const completionRate = (userStats.completedRequests / userStats.totalRequests) * 100;
      if (completionRate < 30) {
        newInsights.push({
          user_id: userId,
          insight_type: 'trend',
          title: 'Forbedre din avslutningsgrad',
          description: `Din nåværende avslutningsgrad er ${completionRate.toFixed(0)}%. Gjennomsnittlig avslutningsgrad er 45%.`,
          data: { 
            current_rate: completionRate,
            average_rate: 45,
            suggestions: ['Legg til mer detaljer i forespørsler', 'Svar raskere på tilbud']
          },
          confidence_score: 0.78
        });
      }
    }

    // Property recommendation
    if (!userStats.hasProperties && userStats.totalRequests > 1) {
      newInsights.push({
        user_id: userId,
        insight_type: 'recommendation',
        title: 'Registrer eiendom for bedre tilbud',
        description: 'Brukere med registrerte eiendommer får 40% mer presise prisestimater og raskere respons.',
        data: { 
          benefit: '40% mer presise prisestimater',
          action: 'register_property'
        },
        confidence_score: 0.72
      });
    }

    // Activity prediction
    if (userStats.daysActive >= 7) {
      const weeklyActivity = Math.floor(userStats.totalRequests / (userStats.daysActive / 7));
      newInsights.push({
        user_id: userId,
        insight_type: 'prediction',
        title: 'Din aktivitetstrend',
        description: `Basert på din aktivitet sender du gjennomsnittlig ${weeklyActivity} forespørsler per uke. Fortsett den gode jobben!`,
        data: { 
          weekly_average: weeklyActivity,
          trend: 'stable',
          next_week_prediction: weeklyActivity + 1
        },
        confidence_score: 0.65
      });
    }

    // Insert new insights
    for (const insight of newInsights) {
      try {
        await supabase
          .from('user_insights')
          .insert(insight);
      } catch (error) {
        console.error('Error inserting insight:', error);
      }
    }

    // Reload insights after generating new ones
    if (newInsights.length > 0) {
      loadPersonalizedInsights();
    }
  };

  const markAsViewed = async (insightId: string) => {
    try {
      await supabase
        .from('user_insights')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', insightId);

      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, viewed_at: new Date().toISOString() }
            : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as viewed:', error);
    }
  };

  const markAsActedOn = async (insight: UserInsight) => {
    try {
      await supabase
        .from('user_insights')
        .update({ acted_on_at: new Date().toISOString() })
        .eq('id', insight.id);

      setInsights(prev => 
        prev.map(i => 
          i.id === insight.id 
            ? { ...i, acted_on_at: new Date().toISOString() }
            : i
        )
      );

      onInsightAction?.(insight, 'acted_on');
    } catch (error) {
      console.error('Error marking insight as acted on:', error);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      await supabase
        .from('user_insights')
        .update({ is_active: false })
        .eq('id', insightId);

      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'prediction':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case 'tip':
        return <Target className="w-4 h-4 text-green-500" />;
      default:
        return <Brain className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-4 h-4 text-primary" />
          Personlige innsikter
          <Badge variant="secondary" className="text-xs">
            AI-drevet
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Analyserer din aktivitet...</p>
            <p className="text-xs">Innsikter vil vises basert på din bruk</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  insight.viewed_at 
                    ? 'bg-muted/30 opacity-75' 
                    : 'bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 border-primary/20'
                }`}
                onClick={() => {
                  if (!insight.viewed_at) {
                    markAsViewed(insight.id);
                  }
                  setSelectedInsight(insight);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence_score * 100)}%
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissInsight(insight.id);
                          }}
                          className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    
                    {/* Confidence Score */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">Pålitelighet:</span>
                      <Progress 
                        value={insight.confidence_score * 100} 
                        className="h-1.5 flex-1 max-w-20"
                      />
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence_score)}`}>
                        {Math.round(insight.confidence_score * 100)}%
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {!insight.viewed_at && (
                          <Badge variant="default" className="text-xs">
                            Ny
                          </Badge>
                        )}
                        {insight.acted_on_at && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <ThumbsUp className="w-2 h-2" />
                            Behandlet
                          </Badge>
                        )}
                      </div>
                      
                      {!insight.acted_on_at && insight.insight_type === 'recommendation' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsActedOn(insight);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          Følg råd
                          <ArrowRight className="w-2 h-2 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {insights.length > 0 && (
          <div className="pt-2 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Innsikter oppdateres automatisk basert på din aktivitet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};