import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  MapPin, 
  Building, 
  TrendingUp,
  ExternalLink,
  Plus
} from 'lucide-react';
import type { UnmatchedNeed } from '../types';

interface UnmatchedNeedsTableProps {
  data: UnmatchedNeed[];
  isLoading?: boolean;
  onRecruitCompany?: (postcode: string, service: string) => void;
}

export const UnmatchedNeedsTable: React.FC<UnmatchedNeedsTableProps> = ({
  data,
  isLoading = false,
  onRecruitCompany
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Udekket behov</CardTitle>
          <CardDescription>Områder med høy etterspørsel men lav dekning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-48" />
                </div>
                <div className="h-8 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getGapBadgeVariant = (gap: string) => {
    switch (gap) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getGapIcon = (gap: string) => {
    switch (gap) {
      case 'high': return AlertTriangle;
      case 'medium': return TrendingUp;
      default: return Building;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Udekket behov
        </CardTitle>
        <CardDescription>
          Områder med høy etterspørsel men lav bedriftsdekning ({data.length} muligheter)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const GapIcon = getGapIcon(item.gap);
            
            return (
              <div 
                key={`${item.postcode}-${item.service}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                    <GapIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{item.postcode}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="capitalize">{item.service}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.count} forespørsler</span>
                      <span>{item.companyCount} bedrifter</span>
                      <span>Sist: {new Date(item.lastSubmission).toLocaleDateString('no-NO')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={getGapBadgeVariant(item.gap)}
                    className="text-xs"
                  >
                    {item.gap === 'high' && 'Høy mangel'}
                    {item.gap === 'medium' && 'Middels mangel'}
                    {item.gap === 'low' && 'Lav mangel'}
                  </Badge>
                  
                  {onRecruitCompany && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRecruitCompany(item.postcode, item.service)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Rekrutter
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ingen udekket behov identifisert</p>
              <p className="text-sm">
                Systemet vil identifisere områder hvor etterspørsel er høyere enn tilbud
              </p>
            </div>
          )}
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <strong>Forretningsmulighet:</strong> Disse områdene representerer potensielle inntektsmuligheter. 
                Vurder å kontakte bedrifter i nærliggende områder eller rekruttere nye leverandører.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};