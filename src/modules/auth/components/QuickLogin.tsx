
import React from 'react';
import { UnifiedQuickLogin, UnifiedQuickLoginProps } from './UnifiedQuickLogin';

export type QuickLoginProps = UnifiedQuickLoginProps;

export const QuickLogin: React.FC<QuickLoginProps> = (props) => {
  // Use our unified implementation with all props passed through
  return <UnifiedQuickLogin {...props} />;
};

// For backward compatibility
export { UnifiedQuickLogin as QuickLoginEnhanced };
