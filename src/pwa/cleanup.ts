/**
 * Service Worker and Cache cleanup utilities
 * Used in development/preview to prevent stale cache issues
 */

export async function cleanupServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const unregisterPromises = registrations.map(registration => {
      console.info('Unregistering service worker:', registration.scope);
      return registration.unregister();
    });
    
    await Promise.all(unregisterPromises);
    console.info(`Cleaned up ${registrations.length} service worker registrations`);
  } catch (error) {
    console.warn('Failed to cleanup service workers:', error);
  }
}

export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) return;
  
  try {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map(cacheName => {
      console.info('Deleting cache:', cacheName);
      return caches.delete(cacheName);
    });
    
    await Promise.all(deletePromises);
    console.info(`Cleared ${cacheNames.length} caches`);
  } catch (error) {
    console.warn('Failed to clear caches:', error);
  }
}

export async function performDevCleanup(): Promise<void> {
  const isDev = import.meta.env.DEV;
  const isPreview = typeof window !== 'undefined' && 
    window.location.hostname.includes('lovableproject.com');
  
  if (isDev || isPreview) {
    console.info('Performing development cleanup...');
    await Promise.all([
      cleanupServiceWorkers(),
      clearAllCaches()
    ]);
  }
}