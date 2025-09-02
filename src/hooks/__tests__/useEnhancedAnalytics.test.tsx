import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { useEnhancedAnalytics } from '../useEnhancedAnalytics';

// Test component to use the hook
function TestComponent() {
  useEnhancedAnalytics();
  return null;
}

describe('useEnhancedAnalytics', () => {
  it('should not throw when used inside a component', () => {
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  it('should return analytics functions', () => {
    let hookResult: any;
    
    function TestComponentWithReturn() {
      hookResult = useEnhancedAnalytics();
      return null;
    }

    render(<TestComponentWithReturn />);

    expect(hookResult).toBeDefined();
    expect(typeof hookResult.trackEvent).toBe('function');
    expect(typeof hookResult.trackStepPerformance).toBe('function');
    expect(typeof hookResult.trackFormValidationError).toBe('function');
    expect(typeof hookResult.trackDropoff).toBe('function');
    expect(typeof hookResult.trackConversionFunnel).toBe('function');
  });
});