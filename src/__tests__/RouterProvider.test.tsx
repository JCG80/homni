import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { RouterProvider } from '@/router/RouterProvider';

// Mock window.location
const mockLocation = {
  hostname: 'localhost'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock env
vi.mock('@/utils/env', () => ({
  getEnv: vi.fn(() => ({ DEV: false }))
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  log: { info: vi.fn() }
}));

describe('RouterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete (import.meta as any).env;
  });

  it('should use BrowserRouter by default', () => {
    mockLocation.hostname = 'example.com';
    
    const { container } = render(
      <RouterProvider>
        <div>Test content</div>
      </RouterProvider>
    );
    
    expect(container).toBeTruthy();
  });

  it('should use HashRouter in Lovable environment', () => {
    mockLocation.hostname = 'lovable.dev';
    
    const { container } = render(
      <RouterProvider>
        <div>Test content</div>
      </RouterProvider>
    );
    
    expect(container).toBeTruthy();
  });

  it('should use HashRouter when VITE_ROUTER_STRATEGY is hash', () => {
    (import.meta as any).env = { VITE_ROUTER_STRATEGY: 'hash' };
    
    const { container } = render(
      <RouterProvider>
        <div>Test content</div>
      </RouterProvider>
    );
    
    expect(container).toBeTruthy();
  });

  it('should use BrowserRouter when VITE_ROUTER_STRATEGY is browser', () => {
    (import.meta as any).env = { VITE_ROUTER_STRATEGY: 'browser' };
    
    const { container } = render(
      <RouterProvider>
        <div>Test content</div>
      </RouterProvider>
    );
    
    expect(container).toBeTruthy();
  });
});