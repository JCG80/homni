import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function UpdateAppButton() {
  const handleUpdate = async () => {
    try {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker?.getRegistrations?.();
      if (registrations) {
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Force reload
      window.location.reload();
    } catch (error) {
      console.warn('Cache clearing failed:', error);
      window.location.reload();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUpdate}
      className="text-xs opacity-70 hover:opacity-100"
      title="Clear cache and reload app"
    >
      <RefreshCw className="h-3 w-3 mr-1" />
      Oppdater app
    </Button>
  );
}