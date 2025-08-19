/**
 * Plugin Loader System - Runtime module loading
 */
import { supabase } from '@/lib/supabaseClient';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  entry_point: string;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface LoadedPlugin {
  manifest: PluginManifest;
  module: any;
  isActive: boolean;
}

export class PluginLoader {
  private loadedPlugins = new Map<string, LoadedPlugin>();
  private pluginCache = new Map<string, any>();

  /**
   * Load all enabled plugins from database
   */
  async loadEnabledPlugins(): Promise<void> {
    try {
      const { data: plugins, error } = await supabase
        .rpc('get_enabled_plugins');

      if (error) {
        console.error('Failed to fetch enabled plugins:', error);
        return;
      }

      for (const plugin of plugins || []) {
        const manifest: PluginManifest = {
          id: plugin.id,
          name: plugin.name,
          version: plugin.version,
          description: plugin.description || '',
          entry_point: plugin.entry_point,
          dependencies: Array.isArray(plugin.dependencies) ? 
            plugin.dependencies.filter((dep: any) => typeof dep === 'string') : [],
          metadata: typeof plugin.metadata === 'object' ? plugin.metadata : {},
        };
        await this.loadPlugin(manifest);
      }
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  /**
   * Load individual plugin
   */
  async loadPlugin(manifest: PluginManifest): Promise<void> {
    try {
      // Check if already loaded
      if (this.loadedPlugins.has(manifest.id)) {
        return;
      }

      // Load dependencies first
      await this.loadDependencies(manifest.dependencies);

      // Load the plugin module
      const module = await this.loadModule(manifest.entry_point);

      // Initialize plugin if it has an init function
      if (module?.init && typeof module.init === 'function') {
        await module.init(this.getPluginContext(manifest));
      }

      // Store loaded plugin
      this.loadedPlugins.set(manifest.id, {
        manifest,
        module,
        isActive: true,
      });

      console.log(`Plugin loaded: ${manifest.name} v${manifest.version}`);
    } catch (error) {
      console.error(`Failed to load plugin ${manifest.name}:`, error);
    }
  }

  /**
   * Unload plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin) return;

    try {
      // Call cleanup function if available
      if (plugin.module?.cleanup && typeof plugin.module.cleanup === 'function') {
        await plugin.module.cleanup();
      }

      // Remove from loaded plugins
      this.loadedPlugins.delete(pluginId);
      
      console.log(`Plugin unloaded: ${plugin.manifest.name}`);
    } catch (error) {
      console.error(`Failed to unload plugin ${plugin.manifest.name}:`, error);
    }
  }

  /**
   * Get loaded plugin by ID
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.loadedPlugins.get(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): LoadedPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Check if plugin is loaded and active
   */
  isPluginActive(pluginId: string): boolean {
    const plugin = this.loadedPlugins.get(pluginId);
    return plugin?.isActive || false;
  }

  /**
   * Execute plugin function
   */
  async executePluginFunction(
    pluginId: string, 
    functionName: string, 
    ...args: any[]
  ): Promise<any> {
    const plugin = this.loadedPlugins.get(pluginId);
    if (!plugin || !plugin.isActive) {
      throw new Error(`Plugin ${pluginId} is not loaded or active`);
    }

    const func = plugin.module[functionName];
    if (!func || typeof func !== 'function') {
      throw new Error(`Function ${functionName} not found in plugin ${pluginId}`);
    }

    return await func(...args);
  }

  /**
   * Load plugin dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      if (!this.loadedPlugins.has(dep)) {
        // Load dependency plugin from database
        const { data: depPlugin } = await supabase
          .from('plugin_manifests')
          .select('*')
          .eq('name', dep)
          .eq('is_enabled', true)
          .single();

        if (depPlugin) {
          const manifest: PluginManifest = {
            id: depPlugin.id,
            name: depPlugin.name,
            version: depPlugin.version,
            description: depPlugin.description || '',
            entry_point: depPlugin.entry_point,
            dependencies: Array.isArray(depPlugin.dependencies) ? 
              depPlugin.dependencies.filter((dep: any) => typeof dep === 'string') : [],
            metadata: typeof depPlugin.metadata === 'object' ? depPlugin.metadata : {},
          };
          await this.loadPlugin(manifest);
        }
      }
    }
  }

  /**
   * Load module from entry point
   */
  private async loadModule(entryPoint: string): Promise<any> {
    // Check cache first
    if (this.pluginCache.has(entryPoint)) {
      return this.pluginCache.get(entryPoint);
    }

    try {
      // Dynamic import for ES modules
      const module = await import(entryPoint);
      this.pluginCache.set(entryPoint, module);
      return module;
    } catch (error) {
      // Fallback for different module formats
      console.warn(`Failed to load module ${entryPoint}:`, error);
      return null;
    }
  }

  /**
   * Get plugin execution context
   */
  private getPluginContext(manifest: PluginManifest): any {
    return {
      pluginId: manifest.id,
      pluginName: manifest.name,
      supabase,
      loader: this,
      // Add other context objects as needed
      utils: {
        toast: (message: string) => console.log(`Plugin ${manifest.name}: ${message}`),
        storage: {
          get: (key: string) => localStorage.getItem(`plugin_${manifest.id}_${key}`),
          set: (key: string, value: string) => 
            localStorage.setItem(`plugin_${manifest.id}_${key}`, value),
        },
      },
    };
  }
}

// Global plugin loader instance
export const pluginLoader = new PluginLoader();

// Auto-load plugins on app start
export const initializePlugins = async (): Promise<void> => {
  await pluginLoader.loadEnabledPlugins();
};