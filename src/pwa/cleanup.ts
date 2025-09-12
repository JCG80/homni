/**
 * PWA & Service Worker Cleanup Utilities
 * Handles development cleanup and service worker management
 */

interface CleanupOptions {
  clearCache?: boolean;
  unregisterSW?: boolean;
  clearStorage?: boolean;
  verbose?: boolean;
}

/**
 * Performs development cleanup for PWA components
 */
export async function performDevCleanup(options: CleanupOptions = {}): Promise<void> {
  const {
    clearCache = false,
    unregisterSW = false,
    clearStorage = false,
    verbose = import.meta.env.DEV
  } = options;

  if (verbose) {
    console.info('[PWA Cleanup] Starting development cleanup...');
  }

  try {
    // In preview mode (non-dev), perform service worker cleanup
    if (import.meta.env.PROD && window.location.hostname.includes('lovableproject.com')) {
      if (verbose) {
        console.info('[PWA Cleanup] Preview mode detected - cleaning service workers');
      }
      await unregisterAllServiceWorkers();
    }

    // Development-specific cleanup
    if (import.meta.env.DEV) {
      if (clearCache) {
        await clearDevelopmentCaches();
      }
      
      if (unregisterSW) {
        await unregisterAllServiceWorkers();
      }
      
      if (clearStorage) {
        await clearDevelopmentStorage();
      }
    }

    if (verbose) {
      console.info('[PWA Cleanup] Development cleanup completed');
    }

  } catch (error) {
    console.warn('[PWA Cleanup] Cleanup failed:', error);
  }
}

/**
 * Unregisters all service workers
 */
async function unregisterAllServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    await Promise.all(
      registrations.map(async (registration) => {
        try {
          await registration.unregister();
          console.info('[PWA Cleanup] Unregistered service worker:', registration.scope);
        } catch (error) {
          console.warn('[PWA Cleanup] Failed to unregister service worker:', error);
        }
      })
    );
  } catch (error) {
    console.warn('[PWA Cleanup] Failed to get service worker registrations:', error);
  }
}

/**
 * Clears development caches
 */
async function clearDevelopmentCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(async (cacheName) => {
        try {
          await caches.delete(cacheName);
          console.info('[PWA Cleanup] Cleared cache:', cacheName);
        } catch (error) {
          console.warn('[PWA Cleanup] Failed to clear cache:', cacheName, error);
        }
      })
    );
  } catch (error) {
    console.warn('[PWA Cleanup] Failed to clear caches:', error);
  }
}

/**
 * Clears development storage (localStorage, sessionStorage, IndexedDB)
 */
async function clearDevelopmentStorage(): Promise<void> {
  try {
    // Clear localStorage (keep essential settings)
    const keysToPreserve = ['theme', 'language', 'accessibility-preferences'];
    const preservedData: Record<string, string> = {};
    
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        preservedData[key] = value;
      }
    });
    
    localStorage.clear();
    
    // Restore preserved data
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.info('[PWA Cleanup] Cleared development storage');
  } catch (error) {
    console.warn('[PWA Cleanup] Failed to clear storage:', error);
  }
}

/**
 * Utility to check if service worker is in self-healing mode
 */
export function isServiceWorkerSelfHealing(): boolean {
  return (
    import.meta.env.PROD && 
    window.location.hostname.includes('lovableproject.com')
  );
}

/**
 * Gets service worker registration status
 */
export async function getServiceWorkerStatus(): Promise<{
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  scope?: string;
}> {
  if (!('serviceWorker' in navigator)) {
    return { isSupported: false, isRegistered: false, isActive: false };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    return {
      isSupported: true,
      isRegistered: !!registration,
      isActive: !!registration?.active,
      scope: registration?.scope
    };
  } catch (error) {
    console.warn('[PWA Status] Failed to get service worker status:', error);
    return { isSupported: true, isRegistered: false, isActive: false };
  }
}
