import React, { useEffect } from 'react';
import { logApiStatusWarnings, getApiStatus } from '@/services/apiStatus';
import { logger } from '@/utils/logger';

/**
 * Component that performs environment checks on mount
 */
export const EnvironmentChecker: React.FC = () => {
  useEffect(() => {
    const checkEnvironment = () => {
      const apiStatus = getApiStatus();
      
      // Log status to console
      logApiStatusWarnings();
      
      // Structured logging for debugging
      logger.info('Environment Check Complete', {
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