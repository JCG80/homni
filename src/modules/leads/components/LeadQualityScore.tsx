import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Clock, 
  User, 
  MapPin, 
  Target, 
  Zap, 
  RefreshCw,
  Info,
  TrendingUp
} from 'lucide-react';
import { useLeadScoring } from '@/hooks/useLeadScoring';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LeadQualityScoreProps {
  leadId: string;
  showRecalculate?: boolean;
  compact?: boolean;
}

export const LeadQualityScore: React.FC<LeadQualityScoreProps> = ({
  leadId,
  showRecalculate = false,
  compact = false
}) => {
  const {
    score,
    pricing,
    isLoading,
    error,
    recalculateScore,
    getScoreGrade,
    getScoreColor,
    getTierBadgeColor,
    formatPrice
  } = useLeadScoring(leadId);

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-destructive text-sm">
            Kunne ikke laste kvalitetsscore
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!score || !pricing) return null;

  const ScoreMetric = ({ 
    icon: Icon, 
    label, 
    value, 
    tooltip 
  }: { 
    icon: any, 
    label: string, 
    value: number, 
    tooltip: string 
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center space-x-2">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
          <Badge variant="outline" className="text-xs px-1">
            {value}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
          style={{ backgroundColor: getScoreColor(score.overall_score) }}
        >
          {getScoreGrade(score.overall_score)}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {score.overall_score}/100
            </span>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: getTierBadgeColor(pricing.tier_name),
                color: getTierBadgeColor(pricing.tier_name)
              }}
            >
              {pricing.tier_name}
            </Badge>
          </div>
          <Progress value={score.overall_score} className="h-2 mt-1" />
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {formatPrice(pricing.base_price_cents)}
          </div>
          <div className="text-xs text-muted-foreground">
            Startpris
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Lead Kvalitet</span>
          </CardTitle>
          {showRecalculate && (
            <Button
              variant="outline"
              size="sm"
              onClick={recalculateScore}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Oppdater
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center space-x-4">
          <div 
            className="flex items-center justify-center w-16 h-16 rounded-full text-white text-xl font-bold"
            style={{ backgroundColor: getScoreColor(score.overall_score) }}
          >
            {getScoreGrade(score.overall_score)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl font-bold">{score.overall_score}</span>
              <span className="text-muted-foreground">/100</span>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: getTierBadgeColor(pricing.tier_name),
                  color: getTierBadgeColor(pricing.tier_name)
                }}
              >
                {pricing.tier_name}
              </Badge>
            </div>
            <Progress value={score.overall_score} className="h-3" />
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Prising</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Pris basert på lead-kvalitet og etterspørsel</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Startpris</div>
              <div className="text-lg font-bold text-primary">
                {formatPrice(pricing.base_price_cents)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Full tilgang</div>
              <div className="text-lg font-bold">
                {formatPrice(pricing.full_price_cents)}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-3">Kvalitetsfaktorer</h4>
          
          <ScoreMetric
            icon={Target}
            label="Fullstendighet"
            value={score.completeness_score}
            tooltip="Hvor komplett er lead-informasjonen"
          />
          
          <ScoreMetric
            icon={Zap}
            label="Haster"
            value={score.urgency_score}
            tooltip="Hvor hastende er forespørselen"
          />
          
          <ScoreMetric
            icon={User}
            label="Kontaktkvalitet"
            value={score.contact_quality_score}
            tooltip="Kvalitet på kontaktinformasjon"
          />
          
          <ScoreMetric
            icon={Clock}
            label="Budsjettindikator"
            value={score.budget_indicator_score}
            tooltip="Indikatorer på budsjett-tilgjengelighet"
          />
          
          <ScoreMetric
            icon={Star}
            label="Kategori-etterspørsel"
            value={score.category_demand_score}
            tooltip="Hvor høy etterspørsel har denne kategorien"
          />
          
          <ScoreMetric
            icon={MapPin}
            label="Lokasjon"
            value={score.location_score}
            tooltip="Attraktivitet av geografisk lokasjon"
          />
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          Sist oppdatert: {new Date(score.calculated_at).toLocaleDateString('nb-NO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </CardContent>
    </Card>
  );
};