
import React from 'react';
import { UnifiedQuickLogin } from './UnifiedQuickLogin';

export interface QuickLoginProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const QuickLogin: React.FC<QuickLoginProps> = ({ onSuccess, redirectTo }) => {
  // Use our unified implementation
  return <UnifiedQuickLogin onSuccess={onSuccess} redirectTo={redirectTo} />;
};

// For backward compatibility
export { UnifiedQuickLogin as QuickLoginEnhanced };
