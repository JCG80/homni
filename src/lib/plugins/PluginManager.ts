/**
 * Plugin Manager - Core plugin system for modular architecture
 * Part of Homni platform development plan
 */

import { PluginManifest, PluginContext, PluginHook, UserProfile, CompanyProfile } from '@/types/unified-models';
import { logger } from '@/utils/logger';

interface LoadedPlugin {
  manifest: PluginManifest;
  instance: any;
  hooks: Map<string, PluginHook[]>;
  enabled: boolean;
}

export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private context: PluginContext | null = null;

  /**
   * Initialize the plugin manager with context
   */
  async initialize(user: UserProfile, company?: CompanyProfile) {
    try {
      this.context = {
        user,
        company,
        features: [], // Would be loaded from database
        modules: [], // Would be loaded from database
        config: {} // Would be loaded from database
      };

      // Load core modules first
      await this.loadCoreModules();

      // Load enabled plugins
      await this.loadEnabledPlugins();

      logger.info('Plugin manager initialized', {
        loadedPlugins: this.plugins.size,
        registeredHooks: this.hooks.size
      });
    } catch (error) {
      logger.error('Failed to initialize plugin manager', { error });
      throw error;
    }
  }

  /**
   * Load core modules that are always available
   */
  private async loadCoreModules() {
    const coreModules = [
      'auth',
      'leads',
      'properties',
      'dashboard',
      'notifications'
    ];

    for (const moduleId of coreModules) {
      try {
        await this.loadModule(moduleId, 'core');
      } catch (error) {
        logger.error(`Failed to load core module: ${moduleId}`, { error });
      }
    }
  }

  /**
   * Load enabled plugins based on user/company settings
   */
  private async loadEnabledPlugins() {
    // This would query the database for enabled plugins
    // For now, we'll use a static list
    const enabledPlugins = [
      'bytt-comparison',
      'boligmappa-docs',
      'propr-selling'
    ];

    for (const pluginId of enabledPlugins) {
      try {
        await this.loadPlugin(pluginId);
      } catch (error) {
        logger.error(`Failed to load plugin: ${pluginId}`, { error });
      }
    }
  }

  /**
   * Load a specific module
   */
  async loadModule(moduleId: string, type: 'core' | 'plugin' = 'plugin'): Promise<boolean> {
    try {
      // Dynamic import based on module type
      const modulePath = type === 'core' 
        ? `../../modules/${moduleId}/index`
        : `../../plugins/${moduleId}/index`;

      const module = await import(modulePath);
      
      if (!module.manifest || !module.default) {
        throw new Error(`Invalid module structure: ${moduleId}`);
      }

      const manifest: PluginManifest = module.manifest;
      const instance = new module.default();

      // Initialize the module/plugin
      if (instance.initialize && typeof instance.initialize === 'function') {
        await instance.initialize(this.context);
      }

      // Register hooks
      const hooks = new Map<string, PluginHook[]>();
      if (instance.hooks) {
        for (const [hookName, hookFunctions] of Object.entries(instance.hooks)) {
          const hookArray = Array.isArray(hookFunctions) ? hookFunctions : [hookFunctions];
          hooks.set(hookName, hookArray as PluginHook[]);
          this.registerHooks(hookName, hookArray as PluginHook[]);
        }
      }

      // Store loaded plugin
      this.plugins.set(moduleId, {
        manifest,
        instance,
        hooks,
        enabled: true
      });

      logger.debug(`Module loaded: ${moduleId}`, { 
        version: manifest.version,
        hooks: hooks.size 
      });

      return true;
    } catch (error) {
      logger.error(`Failed to load module: ${moduleId}`, { error });
      return false;
    }
  }

  /**
   * Load a plugin by ID
   */
  async loadPlugin(pluginId: string): Promise<boolean> {
    return this.loadModule(pluginId, 'plugin');
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        return false;
      }

      // Call cleanup if available
      if (plugin.instance.cleanup && typeof plugin.instance.cleanup === 'function') {
        await plugin.instance.cleanup();
      }

      // Unregister hooks
      for (const [hookName, hookFunctions] of plugin.hooks) {
        this.unregisterHooks(hookName, hookFunctions);
      }

      // Remove from loaded plugins
      this.plugins.delete(pluginId);

      logger.debug(`Plugin unloaded: ${pluginId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to unload plugin: ${pluginId}`, { error });
      return false;
    }
  }

  /**
   * Register hooks for a plugin
   */
  private registerHooks(hookName: string, hooks: PluginHook[]) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const existingHooks = this.hooks.get(hookName)!;
    existingHooks.push(...hooks);

    // Sort by priority (higher priority first)
    existingHooks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unregister hooks for a plugin
   */
  private unregisterHooks(hookName: string, hooks: PluginHook[]) {
    const existingHooks = this.hooks.get(hookName);
    if (!existingHooks) return;

    const hookNames = hooks.map(h => h.name);
    const filteredHooks = existingHooks.filter(h => !hookNames.includes(h.name));
    
    if (filteredHooks.length === 0) {
      this.hooks.delete(hookName);
    } else {
      this.hooks.set(hookName, filteredHooks);
    }
  }

  /**
   * Execute hooks for a specific event
   */
  async executeHooks(hookName: string, ...args: any[]): Promise<any[]> {
    const hooks = this.hooks.get(hookName) || [];
    const results: any[] = [];

    for (const hook of hooks) {
      try {
        const result = await hook.execute(this.context!, ...args);
        results.push(result);
      } catch (error) {
        logger.error(`Hook execution failed: ${hook.name}`, { error, hookName });
        results.push(null);
      }
    }

    return results;
  }

  /**
   * Get loaded plugin information
   */
  getLoadedPlugins(): Array<{ id: string; manifest: PluginManifest; enabled: boolean }> {
    return Array.from(this.plugins.entries()).map(([id, plugin]) => ({
      id,
      manifest: plugin.manifest,
      enabled: plugin.enabled
    }));
  }

  /**
   * Enable/disable a plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    if (enabled && !plugin.enabled) {
      // Re-register hooks
      for (const [hookName, hooks] of plugin.hooks) {
        this.registerHooks(hookName, hooks);
      }
    } else if (!enabled && plugin.enabled) {
      // Unregister hooks
      for (const [hookName, hooks] of plugin.hooks) {
        this.unregisterHooks(hookName, hooks);
      }
    }

    plugin.enabled = enabled;
    return true;
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Check if plugin is loaded and enabled
   */
  isPluginEnabled(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.enabled : false;
  }

  /**
   * Update plugin context (when user/company changes)
   */
  updateContext(user: UserProfile, company?: CompanyProfile) {
    if (this.context) {
      this.context.user = user;
      this.context.company = company;
    }
  }

  /**
   * Cleanup all plugins
   */
  async cleanup() {
    for (const [pluginId] of this.plugins) {
      await this.unloadPlugin(pluginId);
    }
    
    this.plugins.clear();
    this.hooks.clear();
    this.context = null;
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager();