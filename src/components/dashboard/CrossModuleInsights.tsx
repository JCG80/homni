import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Home, 
  Mail, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  modules: string[];
  actionText?: string;
  actionHref?: string;
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

interface CrossModuleData {
  leadToPropertyConversion: number;
  documentCompletionRate: number;
  maintenanceCompliance: number;
  avgResponseTime: number;
  satisfactionScore: number;
}

export const CrossModuleInsights: React.FC = () => {
  const { user } = useIntegratedAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [moduleData, setModuleData] = useState<CrossModuleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCrossModuleData();
    }
  }, [user]);

  const fetchCrossModuleData = async () => {
    try {
      // Simulate cross-module analytics
      const mockData: CrossModuleData = {
        leadToPropertyConversion: 45,
        documentCompletionRate: 67,
        maintenanceCompliance: 80,
        avgResponseTime: 2.3,
        satisfactionScore: 4.2
      };

      const generatedInsights = generateInsights(mockData);
      
      setModuleData(mockData);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error fetching cross-module data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: CrossModuleData): Insight[] => {
    const insights: Insight[] = [];

    // Lead to Property conversion insight
    if (data.leadToPropertyConversion < 60) {
      insights.push({
        id: 'lead-property-conversion',
        type: 'opportunity',
        title: 'Øk eiendomsregistrering',
        description: `Kun ${data.leadToPropertyConversion}% av dine leads har registrert eiendom. Registrering kan forbedre service og oppfølging.`,
        impact: 'high',
        modules: ['leads', 'property'],
        actionText: 'Registrer eiendom',
        actionHref: '/property',
        metrics: {
          current: data.leadToPropertyConversion,
          target: 80,
          unit: '%'
        }
      });
    }

    // Document completion insight
    if (data.documentCompletionRate < 80) {
      insights.push({
        id: 'document-completion',
        type: 'warning',
        title: 'Manglende dokumentasjon',
        description: `Dokumentasjonen din er ${data.documentCompletionRate}% fullført. Komplett dokumentasjon gir bedre tilbud og service.`,
        impact: 'medium',
        modules: ['property', 'documents'],
        actionText: 'Last opp dokumenter',
        actionHref: '/property?tab=documents',
        metrics: {
          current: data.documentCompletionRate,
          target: 95,
          unit: '%'
        }
      });
    }

    // Maintenance compliance success
    if (data.maintenanceCompliance >= 80) {
      insights.push({
        id: 'maintenance-success',
        type: 'success',
        title: 'Utmerket vedlikehold',
        description: `Du følger ${data.maintenanceCompliance}% av vedlikeholdsplanene dine. Dette vil spare deg for kostbare reparasjoner!`,
        impact: 'high',
        modules: ['property', 'maintenance'],
        metrics: {
          current: data.maintenanceCompliance,
          target: 90,
          unit: '%'
        }
      });
    }

    // Response time recommendation
    if (data.avgResponseTime > 3) {
      insights.push({
        id: 'response-time',
        type: 'recommendation',
        title: 'Raskere respons på forespørsler',
        description: `Gjennomsnittlig responstid på ${data.avgResponseTime} dager. Oppfølging innen 24 timer øker sjansen for å få jobb.`,
        impact: 'medium',
        modules: ['leads', 'communication'],
        actionText: 'Se forespørsler',
        actionHref: '/leads'
      });
    }

    // Satisfaction score insight
    if (data.satisfactionScore >= 4.0) {
      insights.push({
        id: 'satisfaction-high',
        type: 'success',
        title: 'Høy kundetilfredshet',
        description: `Din tilfredshetsscore på ${data.satisfactionScore}/5 viser at kunder er fornøyde med tjenestene dine.`,
        impact: 'high',
        modules: ['leads', 'feedback']
      });
    }

    return insights;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-purple-600" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'recommendation':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: { variant: 'destructive' as const, text: 'Høy påvirkning' },
      medium: { variant: 'secondary' as const, text: 'Middels påvirkning' },
      low: { variant: 'outline' as const, text: 'Lav påvirkning' }
    };
    
    return variants[impact as keyof typeof variants] || variants.low;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Innsikt på tvers av moduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Ikke nok data for å generere innsikt ennå
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Innsikt på tvers av moduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const impactBadge = getImpactBadge(insight.impact);
          
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge {...impactBadge} className="text-xs">
                        {impactBadge.text}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    
                    {/* Progress indicator for metrics */}
                    {insight.metrics && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Nåværende: {insight.metrics.current}{insight.metrics.unit}</span>
                          <span>Mål: {insight.metrics.target}{insight.metrics.unit}</span>
                        </div>
                        <Progress 
                          value={(insight.metrics.current / insight.metrics.target) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    {/* Module tags */}
                    <div className="flex items-center gap-2 mb-2">
                      {insight.modules.map(module => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action button */}
                {insight.actionText && insight.actionHref && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(insight.actionHref!)}
                    className="flex items-center gap-2"
                  >
                    {insight.actionText}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Overall Score Summary */}
        {moduleData && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Samlet effektivitetsscore</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Eiendomskobling</span>
                <div className="font-medium">{moduleData.leadToPropertyConversion}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Dokumentasjon</span>
                <div className="font-medium">{moduleData.documentCompletionRate}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Vedlikehold</span>
                <div className="font-medium">{moduleData.maintenanceCompliance}%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};