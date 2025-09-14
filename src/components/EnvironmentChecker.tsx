import React, { useEffect } from 'react';
import { logApiStatusWarnings, getApiStatus } from '@/services/apiStatus';
import { logEnvironmentValidation } from '@/services/environmentValidator';
import { initializeDevTools, monitorPerformance } from '@/utils/devTools';
import { logger } from '@/utils/logger';

/**
 * Component that performs environment checks on mount
 */
export const EnvironmentChecker: React.FC = () => {
  useEffect(() => {
    const checkEnvironment = () => {
      const apiStatus = getApiStatus();
      
      // Enhanced environment validation
      logEnvironmentValidation();
      
      // Initialize development tools in dev mode
      initializeDevTools();
      
      // Start performance monitoring in dev mode
      monitorPerformance();
      
      // Legacy API status logging for compatibility
      logApiStatusWarnings();
      
      // Structured logging for debugging
      logger.info('Enhanced Environment Check Complete', {
        module: 'environment',
        component: 'EnvironmentChecker',
        isOperational: apiStatus.isOperational,
        missingConfigs: apiStatus.missingConfigs,
        warnings: apiStatus.warnings,
        timestamp: new Date().toISOString()
      });
    };

    // Run check on mount
    checkEnvironment();
  }, []);

  // This component doesn't render anything
  return null;
};