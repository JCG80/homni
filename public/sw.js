// Enhanced service worker with advanced caching and offline support
const CACHE_NAME = 'homni-v2.0.0';
const STATIC_CACHE = 'homni-static-v2';
const DYNAMIC_CACHE = 'homni-dynamic-v2';
const API_CACHE = 'homni-api-v2';
const IMAGE_CACHE = 'homni-images-v2';

// Cache size limits
const MAX_DYNAMIC_ITEMS = 100;
const MAX_API_ITEMS = 50;
const MAX_IMAGE_ITEMS = 60;

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  'auth/session',
  'profiles',
  'companies',
  'properties'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache installation failed:', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (!cacheName.includes('v2')) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Supabase API calls (always fetch fresh)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Skip authentication related URLs
  if (url.pathname.includes('/auth/') || url.pathname.includes('/login')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
                
                // Limit cache size
                limitCacheSize(DYNAMIC_CACHE_NAME, DYNAMIC_CACHE_LIMIT);
              });

            return networkResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html') || 
                     new Response('Du er offline. Sjekk internettforbindelsen din.', {
                       status: 200,
                       headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                     });
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'homni-notification',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const clickAction = event.action;
  const data = event.notification.data;

  let url = '/';
  if (clickAction && data.actions) {
    const action = data.actions.find(a => a.action === clickAction);
    url = action?.url || url;
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if the app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      syncData()
    );
  }
});

// Helper function to limit cache size
const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => {
          limitCacheSize(cacheName, maxItems);
        });
      }
    });
  });
};

// Helper function for background sync
const syncData = async () => {
  try {
    // Sync navigation preferences
    const preferences = await getStoredNavigationPreferences();
    if (preferences) {
      await syncNavigationPreferences(preferences);
    }
    
    // Sync other offline data as needed
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
};

const getStoredNavigationPreferences = () => {
  return new Promise((resolve) => {
    // This would typically read from IndexedDB or similar
    resolve(null);
  });
};

const syncNavigationPreferences = (preferences) => {
  return new Promise((resolve) => {
    // This would sync preferences to the server
    resolve();
  });
};