
import React, { createContext, useContext, ReactNode } from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlag';
import { FeatureFlag } from '../types/types';

interface FeatureFlagContextType {
  flags: FeatureFlag[];
  isLoading: boolean;
  isEnabled: (flagName: string, fallbackValue?: boolean) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: [],
  isLoading: true,
  isEnabled: () => false,
});

export const useFeatureFlagContext = () => useContext(FeatureFlagContext);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const { flags, isLoading } = useFeatureFlags();
  
  // Helper function to check if a flag is enabled
  const isEnabled = (flagName: string, fallbackValue = false): boolean => {
    if (isLoading) return fallbackValue;
    
    const flag = flags.find(f => f.name === flagName);
    if (!flag) return fallbackValue;
    
    return flag.is_enabled;
  };
  
  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading, isEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Higher-order component for feature flag conditional rendering
interface WithFeatureFlagProps {
  flagName: string;
  fallbackComponent?: React.ReactNode;
  fallbackValue?: boolean;
}

export const WithFeatureFlag = ({
  flagName,
  children,
  fallbackComponent = null,
  fallbackValue = false
}: WithFeatureFlagProps & { children: ReactNode }) => {
  const { isEnabled, isLoading } = useFeatureFlagContext();
  
  if (isLoading) return null;
  
  return isEnabled(flagName, fallbackValue) ? <>{children}</> : <>{fallbackComponent}</>;
};
