import { useMemo } from 'react';
import { getApiStatus, shouldAttemptApiCall, type ApiStatus } from '@/services/apiStatus';

/**
 * Hook for accessing API status information
 */
export const useApiStatus = () => {
  const apiStatus = useMemo(() => getApiStatus(), []);
  
  const canMakeApiCall = useMemo(() => shouldAttemptApiCall(), []);
  
  return {
    ...apiStatus,
    canMakeApiCall,
    shouldShowWarning: !apiStatus.isOperational || apiStatus.warnings.length > 0
  };
};