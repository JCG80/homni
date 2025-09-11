import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useEnhancedAnalytics } from '../useEnhancedAnalytics';
import { AnalyticsProvider } from '@/lib/analytics/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn()
  }
}));

// Test component wrapper with required providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

// Test component to use the hook
function TestComponent() {
  useEnhancedAnalytics();
  return null;
}

describe('useEnhancedAnalytics', () => {
  it('should not throw when used inside a component with providers', () => {
    expect(() => render(<TestWrapper><TestComponent /></TestWrapper>)).not.toThrow();
  });

  it('should return analytics functions', () => {
    let hookResult: any;
    
    function TestComponentWithReturn() {
      hookResult = useEnhancedAnalytics();
      return null;
    }

    render(<TestWrapper><TestComponentWithReturn /></TestWrapper>);

    expect(hookResult).toBeDefined();
    expect(typeof hookResult.trackEvent).toBe('function');
    expect(typeof hookResult.trackStepPerformance).toBe('function');
    expect(typeof hookResult.trackFormValidationError).toBe('function');
    expect(typeof hookResult.trackDropoff).toBe('function');
    expect(typeof hookResult.trackConversionFunnel).toBe('function');
  });
});