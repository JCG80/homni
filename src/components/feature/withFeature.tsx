import React from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

interface WithFeatureProps {
  flag: string;
  fallback?: React.ReactElement;
  children: React.ReactNode;
}

/**
 * Feature flag wrapper component that never returns null
 * Always shows either the feature or a fallback to prevent blank UI
 */
export function withFeature(
  flag: string, 
  element: React.ReactElement, 
  fallback?: React.ReactElement
): React.ReactElement {
  return (
    <WithFeatureWrapper flag={flag} fallback={fallback}>
      {element}
    </WithFeatureWrapper>
  );
}

const WithFeatureWrapper: React.FC<WithFeatureProps> = ({ 
  flag, 
  fallback = <div className="p-4 text-center text-muted-foreground">Funksjon ikke tilgjengelig</div>, 
  children 
}) => {
  const { isEnabled } = useFeatureFlag(flag, false);
  
  return (
    <>{isEnabled ? children : fallback}</>
  );
};

export { WithFeatureWrapper };