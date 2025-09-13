/**
 * Plugin System Provider - React context for plugin management
 * Part of Homni platform development plan
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { pluginManager } from '@/lib/plugins/PluginManager';
import { usePluginSystem } from '@/hooks/usePluginSystem';
import { UnifiedNavigationItem } from '@/types/unified-models';
import { logger } from '@/utils/logger';

interface PluginSystemContextType {
  isInitialized: boolean;
  loadedPlugins: Array<{ id: string; name: string; enabled: boolean }>;
  navigationItems: UnifiedNavigationItem[];
  dashboardWidgets: any[];
  executeHooks: (hookName: string, ...args: any[]) => Promise<any[]>;
  loadPlugin: (pluginId: string) => Promise<boolean>;
  unloadPlugin: (pluginId: string) => Promise<boolean>;
  togglePlugin: (pluginId: string, enabled: boolean) => Promise<boolean>;
  isPluginEnabled: (pluginId: string) => boolean;
  error: Error | null;
}

const PluginSystemContext = createContext<PluginSystemContextType | null>(null);

export const usePluginSystemContext = () => {
  const context = useContext(PluginSystemContext);
  if (!context) {
    throw new Error('usePluginSystemContext must be used within a PluginSystemProvider');
  }
  return context;
};

interface PluginSystemProviderProps {
  children: React.ReactNode;
}

export const PluginSystemProvider: React.FC<PluginSystemProviderProps> = ({ children }) => {
  const pluginSystem = usePluginSystem();

  useEffect(() => {
    if (pluginSystem.error) {
      logger.error('Plugin system error:', pluginSystem.error);
    }
  }, [pluginSystem.error]);

  const value: PluginSystemContextType = {
    isInitialized: pluginSystem.isInitialized,
    loadedPlugins: pluginSystem.loadedPlugins.map(plugin => ({
      id: plugin.id,
      name: plugin.manifest.name,
      enabled: plugin.enabled
    })),
    navigationItems: pluginSystem.navigationItems,
    dashboardWidgets: pluginSystem.dashboardWidgets,
    executeHooks: pluginSystem.executeHooks,
    loadPlugin: pluginSystem.loadPlugin,
    unloadPlugin: pluginSystem.unloadPlugin,
    togglePlugin: pluginSystem.togglePlugin,
    isPluginEnabled: pluginSystem.isPluginEnabled,
    error: pluginSystem.error
  };

  return (
    <PluginSystemContext.Provider value={value}>
      {children}
    </PluginSystemContext.Provider>
  );
};