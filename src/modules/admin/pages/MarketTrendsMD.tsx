import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

export const MarketTrendsMD: React.FC = () => {
  // Mock data for market trends - in real app this would come from API
  const trends = [
    {
      id: 1,
      category: 'Boligsalg',
      trend: 'up',
      percentage: 12.5,
      value: '2.1M NOK',
      description: 'Gjennomsnittlig salgspris siste 30 dager'
    },
    {
      id: 2,
      category: 'Leiepriser',
      trend: 'up',
      percentage: 8.3,
      value: '18,500 NOK',
      description: 'Månedlig leie per m² i Oslo'
    },
    {
      id: 3,
      category: 'Markedstid',
      trend: 'down',
      percentage: 15.2,
      value: '42 dager',
      description: 'Gjennomsnittlig tid på markedet'
    },
    {
      id: 4,
      category: 'Visninger',
      trend: 'up',
      percentage: 22.1,
      value: '15.3',
      description: 'Gjennomsnittlig antall visninger per bolig'
    }
  ];

  const regions = [
    { name: 'Oslo', growth: 15.2, volume: 1245 },
    { name: 'Bergen', growth: 8.7, volume: 892 },
    { name: 'Trondheim', growth: 12.1, volume: 654 },
    { name: 'Stavanger', growth: 6.3, volume: 543 },
    { name: 'Kristiansand', growth: 9.8, volume: 321 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Trends MD</h1>
          <p className="text-muted-foreground">Comprehensive market analysis and trends dashboard</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trends.map((trend) => (
          <Card key={trend.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{trend.category}</CardTitle>
              {trend.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trend.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={trend.trend === 'up' ? 'text-success' : 'text-destructive'}>
                  {trend.trend === 'up' ? '+' : '-'}{trend.percentage}%
                </span>
                <span>fra forrige måned</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Regional Performance
            </CardTitle>
            <CardDescription>Growth and volume by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{region.name}</span>
                    <div className="text-sm text-muted-foreground">
                      {region.volume} transaksjoner
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-success">+{region.growth}%</div>
                    <div className="text-xs text-muted-foreground">YoY vekst</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>AI-powered market analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-2">Trend Outlook</h4>
                <p className="text-sm text-muted-foreground">
                  Markedet viser sterke tegn til recovery med økt aktivitet i alle regioner. 
                  Priser forventes å stabilisere seg i Q2.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-2">Investment Opportunity</h4>
                <p className="text-sm text-muted-foreground">
                  Bergen og Trondheim viser særlig lovende vekstpotensial med 
                  undervurderte priser sammenlignet med Oslo.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-2">Risk Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Lav risiko i nåværende marked. Renter holder seg stabile og 
                  etterspørsel overstiger tilbud i de fleste segmenter.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};