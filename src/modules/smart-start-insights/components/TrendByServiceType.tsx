import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Zap, Shield, Smartphone, Wifi, Building } from 'lucide-react';
import type { ServiceTypeStats } from '../types';

interface TrendByServiceTypeProps {
  data: ServiceTypeStats[];
  isLoading?: boolean;
}

const getServiceIcon = (service: string) => {
  const serviceLower = service.toLowerCase();
  if (serviceLower.includes('strøm') || serviceLower.includes('energi')) return Zap;
  if (serviceLower.includes('forsikring')) return Shield;
  if (serviceLower.includes('mobil')) return Smartphone;
  if (serviceLower.includes('internett') || serviceLower.includes('fiber')) return Wifi;
  if (serviceLower.includes('bedrift') || serviceLower.includes('business')) return Building;
  return BarChart3;
};

export const TrendByServiceType: React.FC<TrendByServiceTypeProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tjenester etterspørsel</CardTitle>
          <CardDescription>Populæritet og konvertering per tjenestetype</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="h-2 bg-muted rounded w-full" />
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
          <BarChart3 className="w-5 h-5 text-primary" />
          Tjenester etterspørsel
        </CardTitle>
        <CardDescription>
          Populæritet og konvertering per tjenestetype ({data.length} kategorier)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const Icon = getServiceIcon(item.service);
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isTopPerformer = item.conversionRate > 60;
            
            return (
              <div key={item.service} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{item.service}</span>
                    {index < 3 && (
                      <Badge variant="secondary" className="text-xs">
                        Top {index + 1}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.count} søk
                    </span>
                    <Badge 
                      variant={isTopPerformer ? "default" : "outline"}
                      className="text-xs"
                    >
                      {item.conversionRate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.leadCount} leads generert</span>
                    <span>{percentage.toFixed(0)}% av totalt volum</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ingen tjenester registrert ennå</p>
              <p className="text-sm">Statistikk vil vises etter første SmartStart-søk</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};