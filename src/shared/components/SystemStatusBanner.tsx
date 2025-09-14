/**
 * System Status Banner Component
 * Provides comprehensive system health overview with Norwegian localization
 */

import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Database, 
  ShieldCheck, 
  TestTube,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSystemStatus, useSystemStatusText } from '@/shared/hooks/useSystemStatus';

export const SystemStatusBanner: React.FC = () => {
  const status = useSystemStatus();
  const { summary, statusColor } = useSystemStatusText();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Don't show banner if everything is healthy and no issues
  if (status.isHealthy && status.criticalIssues.length === 0 && status.warnings.length === 0) {
    return null;
  }
  
  const getStatusIcon = () => {
    if (status.isHealthy) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    if (status.degradationMode === 'full') {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
    return <AlertCircle className="h-5 w-5 text-warning" />;
  };
  
  const getStatusVariant = () => {
    if (status.isHealthy) return 'default';
    if (status.degradationMode === 'full') return 'destructive';
    return 'secondary';
  };
  
  const getCoverageColor = () => {
    switch (status.coverageStatus) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-info';
      case 'needs-improvement': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-sm">{summary}</h3>
              <p className="text-xs text-muted-foreground">
                Sist oppdatert: {new Date().toLocaleString('no-NO')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant()}>
              {status.degradationMode === 'none' ? 'OK' : 
               status.degradationMode === 'partial' ? 'Degradert' : 'Kritisk'}
            </Badge>
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Service Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-muted-foreground">Dev Doctor:</span>
                <Badge 
                  variant={
                    status.devDoctorStatus === 'success' ? 'default' : 
                    status.devDoctorStatus === 'warning' ? 'secondary' : 
                    status.devDoctorStatus === 'error' ? 'destructive' : 'outline'
                  }
                  className="text-xs"
                >
                  {status.devDoctorStatus === 'success' ? 'OK' : 
                   status.devDoctorStatus === 'warning' ? 'Advarsler' :
                   status.devDoctorStatus === 'error' ? 'Feil' : 'Ukjent'}
                </Badge>
                {status.devDoctorSummary && (
                  <span className="text-xs text-muted-foreground">
                    ({status.devDoctorSummary.passed}/{status.devDoctorSummary.total_checks})
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                <span className="text-muted-foreground">Supabase:</span>
                <Badge 
                  variant={status.supabaseConnected ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {status.supabaseConnected ? 'Tilkoblet' : 'Frakoblet'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <TestTube className="h-4 w-4" />
                <span className="text-muted-foreground">Test dekning:</span>
                <span className={`font-medium text-xs ${getCoverageColor()}`}>
                  {status.testCoverage.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="text-muted-foreground">Feilrate:</span>
                <span className={`font-medium text-xs ${
                  status.errorRate < 0.1 ? 'text-success' :
                  status.errorRate < 0.3 ? 'text-warning' : 'text-destructive'
                }`}>
                  {(status.errorRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Critical Issues */}
            {status.criticalIssues.length > 0 && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <h4 className="font-semibold text-sm text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Kritiske problemer
                </h4>
                <ul className="text-sm space-y-1">
                  {status.criticalIssues.map((issue, index) => (
                    <li key={index} className="text-destructive">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Warnings */}
            {status.warnings.length > 0 && (
              <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <h4 className="font-semibold text-sm text-warning-foreground mb-2">
                  Advarsler
                </h4>
                <ul className="text-sm space-y-1">
                  {status.warnings.map((warning, index) => (
                    <li key={index} className="text-warning-foreground">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Suggestions */}
            {status.suggestions.length > 0 && (
              <div className="mb-4 p-3 bg-info/10 border border-info/20 rounded-md">
                <h4 className="font-semibold text-sm text-info-foreground mb-2">
                  Forslag
                </h4>
                <ul className="text-sm space-y-1">
                  {status.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-info-foreground">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Oppdater status
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-3 w-3 mr-2" />
                  Hjelp og dokumentasjon
                </a>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};