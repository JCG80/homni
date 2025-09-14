/**
 * Real-time Test Status Banner
 * Displays live test execution status and system health during E2E testing
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSystemStatus } from '@/shared/hooks/useSystemStatus';
import { logger } from '@/utils/logger';

interface TestStatus {
  testName: string;
  phase: string;
  status: 'started' | 'in-progress' | 'completed' | 'failed';
  timestamp: string;
  metadata?: any;
}

interface TestStatusBannerProps {
  className?: string;
  showInProduction?: boolean;
}

export const TestStatusBanner: React.FC<TestStatusBannerProps> = ({ 
  className = '',
  showInProduction = false 
}) => {
  const [testStatus, setTestStatus] = useState<TestStatus | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const systemStatus = useSystemStatus();

  // Only show in development or when explicitly enabled
  const shouldShow = import.meta.env.DEV || showInProduction;

  useEffect(() => {
    if (!shouldShow) return;

    // Listen for test status updates from Cypress or other test runners
    const handleTestStatusUpdate = (event: CustomEvent<TestStatus>) => {
      const status = event.detail;
      setTestStatus(status);
      setIsVisible(true);

      // Update progress based on test phase
      const progressMap: Record<string, number> = {
        'started': 10,
        'lead-submission': 25,
        'admin-verification': 50,
        'lead-distribution': 75,
        'completed': 100,
        'failed': 0
      };

      setTestProgress(progressMap[status.phase] || 50);

      // Log test status update
      logger.info('Test status updated', {
        module: 'TestStatusBanner',
        testStatus: status
      });

      // Auto-hide after completion
      if (status.status === 'completed' || status.status === 'failed') {
        setTimeout(() => setIsVisible(false), 5000);
      }
    };

    // Listen for console messages from Cypress (in iframe scenarios)
    const handleConsoleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYSTEM_STATUS_UPDATE') {
        handleTestStatusUpdate(new CustomEvent('testStatusUpdate', { detail: event.data.payload }));
      }
    };

    // Set up event listeners
    window.addEventListener('testStatusUpdate', handleTestStatusUpdate as EventListener);
    window.addEventListener('message', handleConsoleMessage);

    // Simulate test status updates in development (for demo)
    if (import.meta.env.DEV && window.location.search.includes('demo=true')) {
      const demoStatuses: TestStatus[] = [
        { testName: 'Enhanced Lead Flow', phase: 'started', status: 'started', timestamp: new Date().toISOString() },
        { testName: 'Enhanced Lead Flow', phase: 'lead-submission', status: 'in-progress', timestamp: new Date().toISOString() },
        { testName: 'Enhanced Lead Flow', phase: 'admin-verification', status: 'in-progress', timestamp: new Date().toISOString() },
        { testName: 'Enhanced Lead Flow', phase: 'completed', status: 'completed', timestamp: new Date().toISOString() }
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < demoStatuses.length) {
          handleTestStatusUpdate(new CustomEvent('testStatusUpdate', { detail: demoStatuses[index] }));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }

    return () => {
      window.removeEventListener('testStatusUpdate', handleTestStatusUpdate as EventListener);
      window.removeEventListener('message', handleConsoleMessage);
    };
  }, [shouldShow]);

  if (!shouldShow || !isVisible || !testStatus) {
    return null;
  }

  const getStatusColor = (status: TestStatus['status']) => {
    switch (status) {
      case 'started':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
      case 'in-progress':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-600';
      case 'completed':
        return 'bg-green-500/10 border-green-500/20 text-green-600';
      case 'failed':
        return 'bg-red-500/10 border-red-500/20 text-red-600';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-600';
    }
  };

  const getStatusIcon = (status: TestStatus['status']) => {
    switch (status) {
      case 'started':
        return '🚀';
      case 'in-progress':
        return '⚡';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '🔄';
    }
  };

  const formatPhase = (phase: string) => {
    return phase.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-md ${className}`}
      data-testid="test-status-banner"
    >
      <Alert className={`${getStatusColor(testStatus.status)} backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(testStatus.status)}</span>
            <Badge variant="outline" className="text-xs">
              E2E Testing
            </Badge>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close test status banner"
          >
            ✕
          </button>
        </div>
        
        <AlertDescription className="space-y-2">
          <div className="font-medium">
            {testStatus.testName}
          </div>
          
          <div className="text-sm text-gray-600">
            Phase: {formatPhase(testStatus.phase)}
          </div>
          
          <Progress 
            value={testProgress} 
            className="h-2"
            data-testid="test-progress"
          />
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{testStatus.status}</span>
            <span>{testProgress}%</span>
          </div>

          {/* System Status Integration */}
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span>System Status:</span>
              <Badge 
                variant={systemStatus.isHealthy ? "default" : "destructive"}
                className="text-xs"
              >
                {systemStatus.isHealthy ? 'Healthy' : 'Degraded'}
              </Badge>
            </div>
            
            {systemStatus.isDegraded && (
              <div className="text-xs text-orange-600 mt-1">
                {systemStatus.degradationMode === 'partial' ? 'Limited functionality' : 'Critical issues detected'}
              </div>
            )}
          </div>

          {/* Test Metadata */}
          {testStatus.metadata && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500">Test Details</summary>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-20">
                {JSON.stringify(testStatus.metadata, null, 2)}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TestStatusBanner;