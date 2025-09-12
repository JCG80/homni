import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface ServiceWorkerState {
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  registration: ServiceWorkerRegistration | null;
  needsUpdate: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isLoading: true,
    error: null,
    registration: null,
    needsUpdate: false,
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Service Worker ikke støttet i denne nettleseren',
      }));
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setState(prev => ({
        ...prev,
        isRegistered: true,
        isLoading: false,
        registration,
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({
                ...prev,
                needsUpdate: true,
              }));
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        logger.info('Message from service worker:', {
          module: 'useServiceWorker',
          data: event.data
        });
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Service Worker registrering feilet: ${error}`,
      }));
    }
  };

  const updateServiceWorker = () => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestPersistentStorage = async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();
        logger.info('Persistent storage:', {
          module: 'useServiceWorker',
          persistent
        });
        return persistent;
      } catch (error) {
        logger.error('Failed to request persistent storage:', {
          module: 'useServiceWorker'
        }, error as Error);
        return false;
      }
    }
    return false;
  };

  const getStorageEstimate = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
        };
      } catch (error) {
        logger.error('Failed to get storage estimate:', {
          module: 'useServiceWorker'
        }, error as Error);
        return null;
      }
    }
    return null;
  };

  return {
    ...state,
    updateServiceWorker,
    requestPersistentStorage,
    getStorageEstimate,
  };
}