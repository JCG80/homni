/**
 * Tests for performance optimization hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceOptimization } from '@/modules/performance/hooks/usePerformanceOptimization';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { toast } from '@/components/ui/use-toast';

// Mock DOM APIs
const mockIntersectionObserver = vi.fn();
const mockPerformanceObserver = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
    mockIntersectionObserver.mockImplementation(callback);
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  });

  // Mock PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => {
    mockPerformanceObserver.mockImplementation(callback);
    return {
      observe: vi.fn(),
      disconnect: vi.fn(),
      supportedEntryTypes: ['measure', 'navigation'],
    };
  }) as any;

  // Mock performance API
  Object.defineProperty(global, 'performance', {
    value: {
      getEntriesByType: vi.fn().mockReturnValue([{
        loadEventEnd: 2000,
        loadEventStart: 1000,
        domContentLoadedEventEnd: 1500,
        domContentLoadedEventStart: 1200,
        responseStart: 100,
        requestStart: 50,
      }]),
      memory: {
        usedJSHeapSize: 5000000,
      },
    },
    writable: true,
  });

  // Mock document
  Object.defineProperty(global, 'document', {
    value: {
      querySelectorAll: vi.fn().mockReturnValue([]),
      createElement: vi.fn().mockReturnValue({
        setAttribute: vi.fn(),
      }),
      head: {
        appendChild: vi.fn(),
      },
    },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('usePerformanceOptimization', () => {
  it('should initialize with null metrics', () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    expect(result.current.metrics).toBeNull();
    expect(result.current.isOptimizing).toBe(false);
  });

  it('should measure performance metrics on mount', () => {
    renderHook(() => usePerformanceOptimization());
    
    expect(performance.getEntriesByType).toHaveBeenCalledWith('navigation');
  });

  it('should optimize bundle loading', async () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    act(() => {
      result.current.optimizeBundleLoading();
    });

    expect(result.current.isOptimizing).toBe(true);

    // Wait for optimization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.isOptimizing).toBe(false);
  });

  it('should clean up memory', () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    // Mock window.gc
    (global as any).window = { gc: vi.fn() };
    
    act(() => {
      result.current.cleanupMemory();
    });

    expect((global as any).window.gc).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: "Performance Optimized",
      description: "Memory cleanup completed successfully.",
    });
  });

  it('should set up lazy loading for images', () => {
    const mockImages = [
      { dataset: { src: 'image1.jpg' }, setAttribute: vi.fn(), removeAttribute: vi.fn() },
      { dataset: { src: 'image2.jpg' }, setAttribute: vi.fn(), removeAttribute: vi.fn() },
    ];

    (document.querySelectorAll as any).mockReturnValue(mockImages);

    renderHook(() => usePerformanceOptimization());

    expect(document.querySelectorAll).toHaveBeenCalledWith('img[data-src]');
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  it('should set up performance observer', () => {
    // Enable PerformanceObserver with proper mock
    (global as any).PerformanceObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      supportedEntryTypes: ['measure', 'navigation'],
    }));

    renderHook(() => usePerformanceOptimization());

    expect(global.PerformanceObserver).toHaveBeenCalled();
  });

  it('should warn about slow page load', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock slow loading
    (performance.getEntriesByType as any).mockReturnValue([{
      loadEventEnd: 5000,
      loadEventStart: 1000, // 4 second load time
      domContentLoadedEventEnd: 3000,
      domContentLoadedEventStart: 1500,
      responseStart: 100,
      requestStart: 50,
    }]);

    renderHook(() => usePerformanceOptimization());

    expect(consoleSpy).toHaveBeenCalledWith(
      'Slow page load detected:',
      '4000ms'
    );

    consoleSpy.mockRestore();
  });

  it('should handle missing performance API gracefully', () => {
    // Remove performance API
    Object.defineProperty(global, 'performance', {
      value: undefined,
      writable: true,
    });

    expect(() => {
      renderHook(() => usePerformanceOptimization());
    }).not.toThrow();
  });

  it('should cleanup observers on unmount', () => {
    const disconnectSpy = vi.fn();
    
    (global.IntersectionObserver as any).mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: disconnectSpy,
    }));

    const { unmount } = renderHook(() => usePerformanceOptimization());
    
    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});