import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

const STORAGE_KEY = 'homni_offline_data';
const MAX_STORAGE_ITEMS = 100;

export const useOfflineStorage = () => {
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save data to localStorage
  const saveToStorage = useCallback((data: OfflineData[]) => {
    try {
      // Keep only the most recent items
      const trimmed = data.slice(-MAX_STORAGE_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      setOfflineData(trimmed);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, []);

  // Store data for offline sync
  const storeOfflineAction = useCallback((type: string, data: any): string => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    const updated = [...offlineData, newItem];
    saveToStorage(updated);
    return id;
  }, [offlineData, saveToStorage]);

  // Mark item as synced
  const markAsSynced = useCallback((id: string) => {
    const updated = offlineData.map(item => 
      item.id === id ? { ...item, synced: true } : item
    );
    saveToStorage(updated);
  }, [offlineData, saveToStorage]);

  // Get unsynced items
  const getUnsyncedItems = useCallback(() => {
    return offlineData.filter(item => !item.synced);
  }, [offlineData]);

  // Clear synced items
  const clearSyncedItems = useCallback(() => {
    const unsynced = offlineData.filter(item => !item.synced);
    saveToStorage(unsynced);
  }, [offlineData, saveToStorage]);

  // Clear all offline data
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setOfflineData([]);
  }, []);

  // Retry failed sync attempts
  const retrySyncItem = useCallback(async (item: OfflineData, syncFunction: (data: any) => Promise<boolean>) => {
    try {
      const success = await syncFunction(item.data);
      if (success) {
        markAsSynced(item.id);
        return true;
      }
    } catch (error) {
      console.error('Retry sync failed:', error);
    }
    return false;
  }, [markAsSynced]);

  return {
    isOnline,
    offlineData,
    unsyncedCount: getUnsyncedItems().length,
    storeOfflineAction,
    markAsSynced,
    getUnsyncedItems,
    clearSyncedItems,
    clearAllData,
    retrySyncItem,
  };
};
