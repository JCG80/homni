import React from 'react';
import { DevDoctorStatusCard } from '@/components/system/DevDoctorStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';

/**
 * Dev Doctor status page for development and debugging
 * Shows comprehensive development environment health
 */
export const DevDoctorPage: React.FC = () => {
  const handleDownloadReport = () => {
    // In production, this would download the actual JSON report
    const mockReport = {
      timestamp: new Date().toISOString(),
      summary: { status: 'success', total_checks: 15, passed: 13, warnings: 2, errors: 0 },
      message: 'This is a mock report for development'
    };
    
    const blob = new Blob([JSON.stringify(mockReport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dev-doctor-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunDevDoctor = () => {
    // In production, this would trigger a new Dev Doctor run
    console.log('Running Dev Doctor validation...');
    // For now, just reload to simulate refresh
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dev Doctor Status</h1>
        <p className="text-muted-foreground">
          Comprehensive development environment health monitoring and validation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Status Card */}
        <div className="lg:col-span-2">
          <DevDoctorStatusCard />
        </div>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleRunDevDoctor} 
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Run Dev Doctor Check
            </Button>
            
            <Button 
              onClick={handleDownloadReport} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download JSON Report
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full flex items-center gap-2"
              asChild
            >
              <a 
                href="https://github.com/actions" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View in GitHub Actions
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Dev Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Dev Doctor performs comprehensive validation of your development environment:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>ESLint and TypeScript configuration sync</li>
              <li>Package placement validation (dev vs prod dependencies)</li>
              <li>Corrupted package detection</li>
              <li>Supabase environment configuration</li>
              <li>RLS policy security validation</li>
              <li>Project structure verification</li>
            </ul>
            <p>
              Reports are generated as structured JSON for CI/CD integration and dashboard consumption.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CLI Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CLI Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Local Development</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <div>npm run dev:doctor</div>
                <div>npm run dev:doctor:json</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">CI/CD Pipeline</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <div>npm run dev:doctor:ci</div>
                <div>npm run security:full</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Supabase RLS Validation</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                <div>npm run rls:validate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};