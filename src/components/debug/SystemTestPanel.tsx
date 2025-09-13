import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Play, TestTube, Loader2 } from 'lucide-react';
import { runSystemTests, SystemTestResult } from '@/utils/systemTesting';
import { useAuth } from '@/modules/auth/hooks';

export const SystemTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, SystemTestResult> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [overallSuccess, setOverallSuccess] = useState<boolean | null>(null);
  const { isAuthenticated, user } = useAuth();

  const handleRunTests = async () => {
    if (!isAuthenticated) {
      alert('Du må være logget inn for å kjøre systemtester');
      return;
    }

    setIsRunning(true);
    try {
      const { overall, results } = await runSystemTests();
      setTestResults(results);
      setOverallSuccess(overall);
    } catch (error) {
      console.error('Failed to run system tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getResultIcon = (result: SystemTestResult) => {
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getResultBadge = (result: SystemTestResult) => {
    return result.success ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Bestått
      </Badge>
    ) : (
      <Badge variant="destructive">
        Feilet
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          System Testing
        </CardTitle>
        <CardDescription>
          Test User + Company + Lead Flow end-to-end
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isAuthenticated ? `Logget inn som: ${user?.email}` : 'Ikke innlogget'}
          </p>
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning || !isAuthenticated}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Tester...' : 'Kjør tester'}
          </Button>
        </div>

        {overallSuccess !== null && (
          <Alert className={overallSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className="flex items-center gap-2">
              {overallSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              {overallSuccess 
                ? 'Alle systemtester bestått! 🎉' 
                : 'Noen tester feilet. Sjekk detaljene under.'
              }
            </AlertDescription>
          </Alert>
        )}

        {testResults && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Test Resultater:</h4>
            {Object.entries(testResults).map(([testName, result]) => (
              <Card key={testName} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getResultIcon(result)}
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {testName.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  {getResultBadge(result)}
                </div>
                
                {result.details && (
                  <details className="mt-3">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Vis detaljer
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};