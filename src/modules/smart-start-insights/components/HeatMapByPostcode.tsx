import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import type { PostcodeStats } from '../types';

interface HeatMapByPostcodeProps {
  data: PostcodeStats[];
  isLoading?: boolean;
}

export const HeatMapByPostcode: React.FC<HeatMapByPostcodeProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Etterspørsel per postnummer</CardTitle>
          <CardDescription>Geografisk fordeling av SmartStart-søk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted/60 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Etterspørsel per postnummer
        </CardTitle>
        <CardDescription>
          Geografisk fordeling av SmartStart-søk ({data.length} postnummer)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.map((item) => {
            const intensity = (item.count / maxCount) * 100;
            const isHighConversion = item.conversionRate > 50;
            
            return (
              <div
                key={item.postcode}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full bg-primary opacity-20"
                    style={{ opacity: Math.max(0.2, intensity / 100) }}
                  />
                  <div>
                    <div className="font-medium">{item.postcode}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} søk • {item.leadCount} leads
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isHighConversion ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isHighConversion ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {item.conversionRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            );
          })}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ingen data tilgjengelig</p>
              <p className="text-sm">Søk vil vises her etter hvert som de kommer inn</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};