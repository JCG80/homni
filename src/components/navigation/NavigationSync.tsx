/**
 * Navigation Sync Component (Simplified Version)
 * Synchronizes navigation preferences using localStorage only
 * Future: Will integrate with Supabase when navigation_preferences table exists
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigationPreferences } from '@/hooks/navigation/useNavigationPreferences';
import { toast } from 'sonner';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationSyncState {
  isOnline: boolean;
  isSync: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncError: string | null;
}

export const NavigationSync: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { preferences, updatePreferences } = useNavigationPreferences();
  
  const [syncState, setSyncState] = useState<NavigationSyncState>({
    isOnline: navigator.onLine,
    isSync: false,
    lastSync: null,
    pendingChanges: 0,
    syncError: null
  });

  const deviceId = React.useMemo(() => {
    let id = localStorage.getItem('homni-device-id');
    if (!id) {
      id = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('homni-device-id', id);
    }
    return id;
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simplified sync - currently localStorage only
  const syncToCloud = async (prefs: any) => {
    if (!isAuthenticated || !user || !syncState.isOnline) return;

    try {
      setSyncState(prev => ({ ...prev, isSync: true, syncError: null }));

      // Store in enhanced localStorage for cross-tab sync
      const syncData = {
        userId: user.id,
        preferences: prefs,
        deviceId,
        lastUpdated: new Date().toISOString(),
        version: Date.now()
      };

      localStorage.setItem(`homni-nav-sync-${user.id}`, JSON.stringify(syncData));
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: `homni-nav-sync-${user.id}`,
        newValue: JSON.stringify(syncData)
      }));

      setSyncState(prev => ({ 
        ...prev, 
        isSync: false, 
        lastSync: new Date(),
        pendingChanges: 0
      }));

      console.log('Navigation preferences synced locally');

    } catch (error: any) {
      console.error('Navigation sync error:', error);
      setSyncState(prev => ({ 
        ...prev, 
        isSync: false, 
        syncError: error.message,
        pendingChanges: prev.pendingChanges + 1
      }));
    }
  };

  // Sync preferences from other tabs/devices
  const syncFromOtherSources = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const syncData = localStorage.getItem(`homni-nav-sync-${user.id}`);
      
      if (syncData) {
        const parsed = JSON.parse(syncData);
        
        // Only sync if from different device or newer
        if (parsed.deviceId !== deviceId && parsed.version > Date.now() - 300000) { // 5 minutes
          updatePreferences(parsed.preferences);
          
          setSyncState(prev => ({ 
            ...prev, 
            lastSync: new Date(parsed.lastUpdated)
          }));
        }
      }

    } catch (error: any) {
      console.error('Navigation sync error:', error);
      setSyncState(prev => ({ 
        ...prev, 
        syncError: error.message
      }));
    }
  };

  // Auto-sync preferences when they change
  useEffect(() => {
    if (isAuthenticated && syncState.isOnline) {
      const timeoutId = setTimeout(() => {
        syncToCloud(preferences);
      }, 2000); // Debounce sync

      return () => clearTimeout(timeoutId);
    }
  }, [preferences, isAuthenticated, syncState.isOnline]);

  // Listen for cross-tab sync
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `homni-nav-sync-${user.id}` && e.newValue) {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData.deviceId !== deviceId) {
            updatePreferences(syncData.preferences);
            
            toast.success('Navigasjonsinnstillinger synkronisert', {
              description: 'Oppdatert fra annen fane'
            });
          }
        } catch (error) {
          console.error('Cross-tab sync error:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, user, deviceId, updatePreferences]);

  // Manual sync trigger
  const handleManualSync = async () => {
    if (!syncState.isOnline) {
      toast.error('Ingen internettforbindelse');
      return;
    }

    try {
      await syncFromOtherSources();
      await syncToCloud(preferences);
      
      toast.success('Navigasjonsinnstillinger synkronisert', {
        description: 'Lokale innstillinger oppdatert'
      });
    } catch (error) {
      toast.error('Synkronisering feilet', {
        description: 'Prøv igjen senere'
      });
    }
  };

  // Don't render for unauthenticated users
  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Sync status indicator */}
      <div className="flex items-center gap-1">
        {syncState.isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        
        {syncState.isSync ? (
          <Cloud className="h-3 w-3 text-blue-500 animate-pulse" />
        ) : syncState.syncError ? (
          <CloudOff className="h-3 w-3 text-red-500" />
        ) : (
          <Cloud className="h-3 w-3 text-green-500" />
        )}
      </div>

      {/* Pending changes badge */}
      {syncState.pendingChanges > 0 && (
        <Badge variant="outline" className="h-5 text-xs">
          {syncState.pendingChanges}
        </Badge>
      )}

      {/* Manual sync button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={!syncState.isOnline || syncState.isSync}
        className="h-6 px-2 text-xs"
      >
        Synk
      </Button>

      {/* Last sync info */}
      {syncState.lastSync && (
        <span className="text-xs text-muted-foreground">
          {new Intl.RelativeTimeFormat('no', { numeric: 'auto' }).format(
            Math.floor((syncState.lastSync.getTime() - Date.now()) / (1000 * 60)),
            'minute'
          )}
        </span>
      )}
    </div>
  );
};