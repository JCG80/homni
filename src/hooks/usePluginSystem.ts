/**
 * Plugin System Hook - React hook for plugin management
 * Part of the modular plugin architecture
 */

import { useEffect, useState, useCallback } from 'react';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { pluginManager } from '@/lib/plugins/PluginManager';
import { PluginManifest, UnifiedNavigationItem } from '@/types/unified-models';
import { logger } from '@/utils/logger';

interface PluginSystemState {
  isInitialized: boolean;
  loadedPlugins: Array<{ id: string; manifest: PluginManifest; enabled: boolean }>;
  navigationItems: UnifiedNavigationItem[];
  dashboardWidgets: any[];
  error: Error | null;
}

export const usePluginSystem = () => {
  const { user, profile } = useIntegratedAuth();
  const [state, setState] = useState<PluginSystemState>({
    isInitialized: false,
    loadedPlugins: [],
    navigationItems: [],
    dashboardWidgets: [],
    error: null
  });

  // Initialize plugin system when user is available
  useEffect(() => {
    if (!user || !profile) return;

    const initializePlugins = async () => {
      try {
        setState(prev => ({ ...prev, error: null }));

        // Initialize plugin manager with user context
        await pluginManager.initialize(
          {
            id: profile.id || '',
            user_id: user.id,
            display_name: profile.full_name || profile.display_name || '',
            role: profile.role || 'user',
            account_type: profile.account_type || 'privatperson',
            company_id: profile.company_id,
            notification_preferences: profile.notification_preferences || {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              system: true
            },
            ui_preferences: profile.ui_preferences || {
              theme: 'system',
              language: 'no',
              dashboard_layout: 'standard',
              preferred_modules: [],
              quick_actions: []
            },
            feature_overrides: profile.feature_overrides || {},
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at || new Date().toISOString()
          },
          profile.company_profile
        );

        // Get loaded plugins
        const loadedPlugins = pluginManager.getLoadedPlugins();

        // Collect navigation items from plugins
        const navigationResults = await pluginManager.executeHooks('navigation:items');
        const navigationItems = navigationResults.flat().filter(Boolean);

        // Collect dashboard widgets from plugins
        const widgetResults = await pluginManager.executeHooks('dashboard:widgets');
        const dashboardWidgets = widgetResults.flat().filter(Boolean);

        setState({
          isInitialized: true,
          loadedPlugins,
          navigationItems,
          dashboardWidgets,
          error: null
        });

        logger.info('Plugin system initialized', {
          pluginCount: loadedPlugins.length,
          navigationItems: navigationItems.length,
          widgets: dashboardWidgets.length
        });

      } catch (error) {
        logger.error('Failed to initialize plugin system', { error });
        setState(prev => ({
          ...prev,
          error: error as Error,
          isInitialized: false
        }));
      }
    };

    initializePlugins();

    // Cleanup on unmount
    return () => {
      pluginManager.cleanup();
    };
  }, [user, profile]);

  // Execute plugin hooks
  const executeHooks = useCallback(async (hookName: string, ...args: any[]) => {
    if (!state.isInitialized) {
      logger.warn('Plugin system not initialized', { hookName });
      return [];
    }

    try {
      return await pluginManager.executeHooks(hookName, ...args);
    } catch (error) {
      logger.error('Hook execution failed', { hookName, error });
      return [];
    }
  }, [state.isInitialized]);

  // Load additional plugin
  const loadPlugin = useCallback(async (pluginId: string) => {
    try {
      const success = await pluginManager.loadPlugin(pluginId);
      if (success) {
        // Refresh state
        const loadedPlugins = pluginManager.getLoadedPlugins();
        setState(prev => ({ ...prev, loadedPlugins }));
      }
      return success;
    } catch (error) {
      logger.error('Failed to load plugin', { pluginId, error });
      return false;
    }
  }, []);

  // Unload plugin
  const unloadPlugin = useCallback(async (pluginId: string) => {
    try {
      const success = await pluginManager.unloadPlugin(pluginId);
      if (success) {
        // Refresh state
        const loadedPlugins = pluginManager.getLoadedPlugins();
        setState(prev => ({ ...prev, loadedPlugins }));
      }
      return success;
    } catch (error) {
      logger.error('Failed to unload plugin', { pluginId, error });
      return false;
    }
  }, []);

  // Toggle plugin
  const togglePlugin = useCallback(async (pluginId: string, enabled: boolean) => {
    try {
      const success = await pluginManager.togglePlugin(pluginId, enabled);
      if (success) {
        // Refresh state
        const loadedPlugins = pluginManager.getLoadedPlugins();
        setState(prev => ({ ...prev, loadedPlugins }));
      }
      return success;
    } catch (error) {
      logger.error('Failed to toggle plugin', { pluginId, enabled, error });
      return false;
    }
  }, []);

  // Check if plugin is enabled
  const isPluginEnabled = useCallback((pluginId: string) => {
    return pluginManager.isPluginEnabled(pluginId);
  }, []);

  // Get plugin by ID
  const getPlugin = useCallback((pluginId: string) => {
    return pluginManager.getPlugin(pluginId);
  }, []);

  return {
    // State
    isInitialized: state.isInitialized,
    loadedPlugins: state.loadedPlugins,
    navigationItems: state.navigationItems,
    dashboardWidgets: state.dashboardWidgets,
    error: state.error,

    // Actions
    executeHooks,
    loadPlugin,
    unloadPlugin,
    togglePlugin,
    isPluginEnabled,
    getPlugin
  };
};