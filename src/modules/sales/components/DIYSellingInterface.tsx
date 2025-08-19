import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { diySellingService } from '../services/diySellingService';
import { SellingProcess, MarketAnalysis } from '../types/salesTypes';

export const DIYSellingInterface = () => {
  const [process, setProcess] = useState<SellingProcess | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartProcess = async () => {
    setIsLoading(true);
    try {
      const newProcess = await diySellingService.initializeSellingProcess('test-property-id');
      const marketData = await diySellingService.generateMarketAnalysis('test-property-id');
      setProcess(newProcess);
      setAnalysis(marketData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DIY Boligsalg</CardTitle>
          <CardDescription>
            Selg boligen selv med profesjonell veiledning (Propr.no stil)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleStartProcess} disabled={isLoading}>
            {isLoading ? 'Starter prosess...' : 'Start salgsprosess'}
          </Button>
        </CardContent>
      </Card>

      {process && (
        <Card>
          <CardHeader>
            <CardTitle>Salgsprosess</CardTitle>
            <CardDescription>
              Status: {process.status} - Steg {process.currentStep + 1} av {process.totalSteps}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(process.currentStep / process.totalSteps) * 100} className="mb-4" />
            <div className="space-y-2">
              {process.steps.map((step, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={index <= process.currentStep ? 'font-medium' : 'text-muted-foreground'}>
                    {step.title}
                  </span>
                  <Badge variant={
                    index < process.currentStep ? 'default' : 
                    index === process.currentStep ? 'secondary' : 'outline'
                  }>
                    {index < process.currentStep ? 'Fullført' : 
                     index === process.currentStep ? 'Pågår' : 'Venter'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Markedsanalyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimert verdi</p>
                <p className="text-2xl font-bold">
                  Kr {analysis.estimatedValue.toLocaleString('no')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markedstid</p>
                <p className="text-lg font-semibold">{analysis.averageTimeOnMarket} dager</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sammenlignbare salg</p>
                <p className="text-lg font-semibold">{analysis.comparableSales.length} boliger</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markedstrend</p>
                <Badge variant={analysis.marketTrend === 'rising' ? 'default' : 'secondary'}>
                  {analysis.marketTrend === 'rising' ? 'Stigende' : 
                   analysis.marketTrend === 'falling' ? 'Fallende' : 'Stabil'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};