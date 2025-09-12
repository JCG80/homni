import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
};

// Mock ResizeObserver  
(global as any).ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock react-window for performance tests
vi.mock('react-window', () => ({
  FixedSizeList: vi.fn(({ children, itemCount, itemData }: any) => {
    const items = Array.from({ length: Math.min(itemCount, 5) }).map((_, index) =>
      children({ index, style: {}, data: itemData })
    );
    return React.createElement('div', { 'data-testid': 'virtualized-list' }, items);
  })
}));