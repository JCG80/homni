/**
 * Enhanced System Status Hook
 * Consolidates all system health monitoring into a single hook
 */

import { useMemo } from 'react';
import { useApiStatus } from '@/hooks/useApiStatus';
import { validateEnvironment, getServiceStatus } from '@/services/environmentValidator';

export interface SystemStatus {
  // Overall health
  isHealthy: boolean;
  isDegraded: boolean;
  degradationMode: 'none' | 'partial' | 'full';
  
  // Service status
  supabaseConnected: boolean;
  authenticationEnabled: boolean;
  databaseConnected: boolean;
  
  // CI/CD Status (mocked for now - future GitHub API integration)
  ciStatus: 'success' | 'failed' | 'pending' | 'unknown';
  lastBuildTime?: string;
  
  // Test coverage (mocked for now - future coverage report integration)
  testCoverage: number;
  coverageStatus: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  
  // Performance metrics
  apiResponseTime?: number;
  errorRate: number;
  
  // Issues and warnings
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Main system status hook
 */
export const useSystemStatus = (): SystemStatus => {
  const apiStatus = useApiStatus();
  
  const systemStatus = useMemo((): SystemStatus => {
    const validation = validateEnvironment();
    const serviceStatus = getServiceStatus();
    
    // Determine overall health
    const isHealthy = validation.isValid && apiStatus.canMakeApiCall;
    const isDegraded = validation.degradationMode !== 'none' || !apiStatus.canMakeApiCall;
    
    // Mock CI status (future: integrate with GitHub Actions API)
    const ciStatus: SystemStatus['ciStatus'] = isDegraded ? 'failed' : 'success';
    
    // Mock test coverage (future: parse from coverage reports)
    const testCoverage = 92.4; // Placeholder
    const coverageStatus: SystemStatus['coverageStatus'] = 
      testCoverage >= 90 ? 'excellent' :
      testCoverage >= 80 ? 'good' :
      testCoverage >= 70 ? 'needs-improvement' : 'critical';
    
    // Performance metrics
    const errorRate = apiStatus.warnings.length / 10; // Simple calculation
    
    return {
      // Overall health
      isHealthy,
      isDegraded,
      degradationMode: validation.degradationMode,
      
      // Service status
      supabaseConnected: serviceStatus.supabase === 'available',
      authenticationEnabled: serviceStatus.authentication === 'enabled',
      databaseConnected: serviceStatus.database === 'connected',
      
      // CI/CD Status
      ciStatus,
      lastBuildTime: new Date().toISOString(), // Mock timestamp
      
      // Test coverage
      testCoverage,
      coverageStatus,
      
      // Performance
      errorRate,
      
      // Issues and feedback
      criticalIssues: validation.criticalIssues,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    };
  }, [apiStatus]);
  
  return systemStatus;
};

/**
 * Hook for getting system status summary text in Norwegian
 */
export const useSystemStatusText = () => {
  const status = useSystemStatus();
  
  const summary = useMemo(() => {
    if (status.isHealthy) {
      return 'Systemet kjører normalt';
    }
    
    if (status.degradationMode === 'full') {
      return 'Kritiske tjenester er utilgjengelige';
    }
    
    if (status.degradationMode === 'partial') {
      return 'Begrenset funksjonalitet aktivert';
    }
    
    return 'Systemstatus ukjent';
  }, [status]);
  
  const statusColor = useMemo(() => {
    if (status.isHealthy) return 'success';
    if (status.degradationMode === 'full') return 'destructive';
    return 'warning';
  }, [status]);
  
  return { summary, statusColor };
};