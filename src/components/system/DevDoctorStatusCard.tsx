import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Download,
  ExternalLink 
} from 'lucide-react';
import { useDevDoctorStatus, type DevDoctorReport } from '@/hooks/useDevDoctorStatus';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variant = status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive';
  return (
    <Badge variant={variant} className="ml-2">
      {status.toUpperCase()}
    </Badge>
  );
};

const ReportSummary = ({ report }: { report: DevDoctorReport }) => (
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="text-muted-foreground">Total Checks:</span>
      <span className="ml-2 font-medium">{report.summary.total_checks}</span>
    </div>
    <div>
      <span className="text-muted-foreground">Passed:</span>
      <span className="ml-2 font-medium text-green-600">{report.summary.passed}</span>
    </div>
    <div>
      <span className="text-muted-foreground">Warnings:</span>
      <span className="ml-2 font-medium text-yellow-600">{report.summary.warnings}</span>
    </div>
    <div>
      <span className="text-muted-foreground">Errors:</span>
      <span className="ml-2 font-medium text-red-600">{report.summary.errors}</span>
    </div>
  </div>
);

const RecommendationsList = ({ report }: { report: DevDoctorReport }) => {
  if (report.recommendations.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {report.recommendations.slice(0, 3).map((rec, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-xs bg-muted px-1 rounded uppercase font-mono">
              {rec.category}
            </span>
            <span>{rec.message}</span>
          </li>
        ))}
        {report.recommendations.length > 3 && (
          <li className="text-xs text-muted-foreground">
            +{report.recommendations.length - 3} more recommendations
          </li>
        )}
      </ul>
    </div>
  );
};

export const DevDoctorStatusCard: React.FC = () => {
  const { report, isLoading, lastUpdated, error } = useDevDoctorStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Dev Doctor Status
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-500" />
            Dev Doctor Status
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button size="sm" variant="outline" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Dev Doctor Status
            <Badge variant="secondary">No Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent Dev Doctor reports available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <StatusIcon status={report.summary.status} />
          Dev Doctor Status
          <StatusBadge status={report.summary.status} />
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ReportSummary report={report} />
        
        {/* Critical Issues */}
        {(report.dependencies.version_conflicts || report.dependencies.corrupted_packages > 0) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">Critical Issues</span>
            </div>
            <ul className="text-xs text-red-700 space-y-1">
              {report.dependencies.version_conflicts && (
                <li>• Version conflicts detected</li>
              )}
              {report.dependencies.corrupted_packages > 0 && (
                <li>• {report.dependencies.corrupted_packages} corrupted packages found</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Warnings */}
        {(report.dependencies.misplaced_packages > 0 || report.supabase.warnings.length > 0) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800">Warnings</span>
            </div>
            <ul className="text-xs text-yellow-700 space-y-1">
              {report.dependencies.misplaced_packages > 0 && (
                <li>• {report.dependencies.misplaced_packages} packages in wrong dependencies section</li>
              )}
              {report.supabase.warnings.slice(0, 2).map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <RecommendationsList report={report} />

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            Download Report
          </Button>
          <Button size="sm" variant="ghost" className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            View in CI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};