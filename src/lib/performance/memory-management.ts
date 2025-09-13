/**
 * Advanced Memory Management and Optimization
 */

// Memory monitoring and cleanup utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: Array<() => void> = [];
  private monitoringInterval?: NodeJS.Timeout;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB threshold

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Start memory monitoring
  startMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds

    // Listen for memory pressure events
    if ('memory' in performance) {
      (performance as any).addEventListener('memory', this.handleMemoryPressure.bind(this));
    }
  }

  // Stop memory monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  // Check current memory usage
  private checkMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const memInfo = (performance as any).memory;
    const usedMemory = memInfo.usedJSHeapSize;
    const totalMemory = memInfo.totalJSHeapSize;
    const memoryLimit = memInfo.jsHeapSizeLimit;

    const usagePercentage = (usedMemory / memoryLimit) * 100;

    if (usagePercentage > 75) {
      console.warn(`[MEMORY WARNING] High memory usage: ${usagePercentage.toFixed(2)}%`);
      this.performCleanup();
    }

    // Log memory stats in development
    if (import.meta.env.DEV) {
      console.log(`[MEMORY] Used: ${(usedMemory / 1024 / 1024).toFixed(2)}MB, Total: ${(totalMemory / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  // Handle memory pressure events
  private handleMemoryPressure(event: any): void {
    console.warn('[MEMORY PRESSURE] System is under memory pressure, performing cleanup');
    this.performCleanup();
  }

  // Register cleanup task
  registerCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  // Perform memory cleanup
  performCleanup(): void {
    // Run registered cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('[CLEANUP ERROR]', error);
      }
    });

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Clear browser caches if possible
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('cache')) {
            caches.delete(name);
          }
        });
      });
    }
  }

  // Get memory statistics
  getMemoryStats(): any {
    if (!('memory' in performance)) {
      return { supported: false };
    }

    const memInfo = (performance as any).memory;
    return {
      supported: true,
      usedJSHeapSize: memInfo.usedJSHeapSize,
      totalJSHeapSize: memInfo.totalJSHeapSize,
      jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
      usagePercentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100,
    };
  }
}

// WeakMap-based cache for component optimization
export class ComponentCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  private timeouts = new WeakMap<K, NodeJS.Timeout>();

  set(key: K, value: V, ttl?: number): void {
    this.cache.set(key, value);

    if (ttl) {
      // Clear any existing timeout
      const existingTimeout = this.timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        this.cache.delete(key);
        this.timeouts.delete(key);
      }, ttl);

      this.timeouts.set(key, timeout);
    }
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
    return this.cache.delete(key);
  }
}

// Memory-efficient data structures
export const memoryOptimizedStructures = {
  // Circular buffer for logs/events
  createCircularBuffer<T>(maxSize: number) {
    const buffer: T[] = [];
    let head = 0;

    return {
      push(item: T): void {
        if (buffer.length < maxSize) {
          buffer.push(item);
        } else {
          buffer[head] = item;
          head = (head + 1) % maxSize;
        }
      },

      getAll(): T[] {
        if (buffer.length < maxSize) {
          return [...buffer];
        }
        return [...buffer.slice(head), ...buffer.slice(0, head)];
      },

      clear(): void {
        buffer.length = 0;
        head = 0;
      },

      size(): number {
        return buffer.length;
      },
    };
  },

  // LRU Cache implementation
  createLRUCache<K, V>(maxSize: number) {
    const cache = new Map<K, V>();

    return {
      get(key: K): V | undefined {
        const value = cache.get(key);
        if (value !== undefined) {
          // Move to end (most recently used)
          cache.delete(key);
          cache.set(key, value);
        }
        return value;
      },

      set(key: K, value: V): void {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          // Remove least recently used (first item)
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },

      clear(): void {
        cache.clear();
      },

      size(): number {
        return cache.size;
      },
    };
  },
};

// Object pooling for frequently created objects
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;

  constructor(createFn: () => T, resetFn?: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    const obj = this.pool.pop();
    if (obj) {
      return obj;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.resetFn) {
      this.resetFn(obj);
    }
    this.pool.push(obj);
  }

  size(): number {
    return this.pool.length;
  }
}

// Performance monitoring integration
export const memoryPerformanceIntegration = {
  // Initialize memory management
  initialize(): void {
    const memoryManager = MemoryManager.getInstance();
    
    // Register cleanup tasks
    memoryManager.registerCleanupTask(() => {
      // Clear React Query cache when under memory pressure
      import('../performance/caching').then(({ cacheCleanup }) => {
        cacheCleanup.optimizeMemoryUsage();
      });
    });

    memoryManager.registerCleanupTask(() => {
      // Clear component caches
      if ((window as any).componentCaches) {
        (window as any).componentCaches.forEach((cache: any) => {
          if (typeof cache.clear === 'function') {
            cache.clear();
          }
        });
      }
    });

    memoryManager.startMonitoring();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      memoryManager.stopMonitoring();
    });
  },

  // Get comprehensive performance report
  getPerformanceReport(): any {
    const memoryManager = MemoryManager.getInstance();
    const memoryStats = memoryManager.getMemoryStats();
    
    return {
      timestamp: new Date().toISOString(),
      memory: memoryStats,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        paint: performance.getEntriesByType('paint'),
        measure: performance.getEntriesByType('measure'),
      },
    };
  },
};

// Initialize memory management when module is imported
if (typeof window !== 'undefined') {
  memoryPerformanceIntegration.initialize();
}