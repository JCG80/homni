/**
 * Plugin Manager - Core plugin-driven architecture
 * Manages module loading, feature flags, and plugin lifecycle
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  ModuleMetadata, 
  FeatureFlag, 
  PluginContext, 
  PluginHook,
  UserProfile,
  CompanyProfile 
} from '@/types/unified-data-models';

export class PluginManager {
  private static instance: PluginManager;
  private loadedModules: Map<string, ModuleMetadata> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private context: PluginContext | null = null;

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Initialize the plugin system with user context
   */
  async initialize(user: UserProfile, company?: CompanyProfile): Promise<void> {
    console.log('🚀 Initializing Plugin Manager for user:', user.role);
    
    try {
      // Load feature flags first
      await this.loadFeatureFlags(user);
      
      // Load available modules based on user role
      await this.loadModules(user);
      
      // Set up plugin context
      this.context = {
        user,
        company,
        features: Array.from(this.featureFlags.values()),
        modules: Array.from(this.loadedModules.values()),
        config: {}
      };
      
      console.log('✅ Plugin Manager initialized successfully');
      console.log(`📊 Loaded ${this.loadedModules.size} modules, ${this.featureFlags.size} feature flags`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Plugin Manager:', error);
      throw error;
    }
  }

  /**
   * Load feature flags based on user role and targeting
   */
  private async loadFeatureFlags(user: UserProfile): Promise<void> {
    try {
      const { data: flags, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('is_enabled', true);

      if (error) throw error;

      // Filter flags based on user role targeting
      const applicableFlags = flags?.filter(flag => {
        if (!flag.target_roles || flag.target_roles.length === 0) {
          return true; // No targeting means applies to all
        }
        return (flag.target_roles as string[]).includes(user.role);
      }) || [];

      // Store in memory for fast access
      applicableFlags.forEach(flag => {
        this.featureFlags.set(flag.name, flag);
      });

      console.log(`🎌 Loaded ${applicableFlags.length} feature flags for role: ${user.role}`);
      
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      // Continue with empty flags rather than failing completely
    }
  }

  /**
   * Load modules based on user permissions and role
   */
  private async loadModules(user: UserProfile): Promise<void> {
    try {
      const { data: modules, error } = await supabase
        .from('module_metadata')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      // Filter modules based on user access level
      const accessibleModules = modules?.filter(module => {
        return this.hasModuleAccess(module as any, user);
      }) || [];

      // Store in memory for fast access
      accessibleModules.forEach(module => {
        this.loadedModules.set(module.name, module as any);
      });

      console.log(`📦 Loaded ${accessibleModules.length} modules for role: ${user.role}`);
      
    } catch (error) {
      console.error('Failed to load modules:', error);
    }
  }

  /**
   * Check if user has access to a specific module
   */
  private hasModuleAccess(module: ModuleMetadata, user: UserProfile): boolean {
    // Core modules are available to everyone
    if (module.module_type === 'core') {
      return true;
    }

    // Role-based access control
    const roleHierarchy: Record<string, number> = {
      'guest': 0,
      'user': 20,
      'company': 40,
      'content_editor': 60,
      'admin': 80,
      'master_admin': 100
    };

    const userLevel = roleHierarchy[user.role] || 0;

    // Admin modules require admin+ access
    if (module.name.includes('admin') && userLevel < 80) {
      return false;
    }

    // Company modules require company+ access
    if (module.name.includes('company') && userLevel < 40) {
      return false;
    }

    return true;
  }

  /**
   * Check if a feature is enabled for the current user
   */
  isFeatureEnabled(featureName: string): boolean {
    const flag = this.featureFlags.get(featureName);
    if (!flag) return false;

    // Check basic enabled state
    if (!flag.is_enabled) return false;

    // Check rollout percentage (simple implementation)
    if (flag.rollout_percentage < 100) {
      const hash = this.hashString(featureName + (this.context?.user.id || ''));
      return (hash % 100) < flag.rollout_percentage;
    }

    return true;
  }

  /**
   * Check if a module is loaded and available
   */
  isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  /**
   * Get loaded modules for navigation/UI purposes
   */
  getLoadedModules(): ModuleMetadata[] {
    return Array.from(this.loadedModules.values());
  }

  /**
   * Get enabled features for the current user
   */
  getEnabledFeatures(): FeatureFlag[] {
    return Array.from(this.featureFlags.values()).filter(flag => 
      this.isFeatureEnabled(flag.name)
    );
  }

  /**
   * Register a plugin hook
   */
  registerHook(hookName: string, hook: PluginHook): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    const hooks = this.hooks.get(hookName)!;
    hooks.push(hook);
    
    // Sort by priority (higher priority first)
    hooks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute hooks for a given event
   */
  async executeHooks(hookName: string, ...args: any[]): Promise<any[]> {
    const hooks = this.hooks.get(hookName) || [];
    const results: any[] = [];

    for (const hook of hooks) {
      try {
        if (this.context) {
          const result = await hook.execute(this.context, ...args);
          results.push(result);
        }
      } catch (error) {
        console.error(`Hook ${hookName} failed:`, error);
        // Continue with other hooks even if one fails
      }
    }

    return results;
  }

  /**
   * Get module navigation items based on loaded modules
   */
  getModuleNavigation(): Array<{
    name: string;
    title: string;
    href: string;
    icon?: string;
    category: string;
  }> {
    const navigation: Array<{
      name: string;
      title: string;
      href: string;
      icon?: string;
      category: string;
    }> = [];

    for (const module of this.loadedModules.values()) {
      // Map module names to navigation items
      switch (module.name) {
        case 'bytt-leads':
          navigation.push({
            name: module.name,
            title: 'Sammenlign & Bestill',
            href: '/sammenlign',
            icon: 'search',
            category: 'core'
          });
          break;
        case 'boligmappa-docs':
          navigation.push({
            name: module.name,
            title: 'Boligmappa',
            href: '/boligmappa',
            icon: 'folder',
            category: 'core'
          });
          break;
        case 'propr-diy':
          navigation.push({
            name: module.name,
            title: 'Selg Selv',
            href: '/selg-selv',
            icon: 'home',
            category: 'core'
          });
          break;
        case 'admin-panel':
          if (this.hasAdminAccess()) {
            navigation.push({
              name: module.name,
              title: 'Admin',
              href: '/admin',
              icon: 'settings',
              category: 'admin'
            });
          }
          break;
        case 'analytics':
          if (this.hasAnalyticsAccess()) {
            navigation.push({
              name: module.name,
              title: 'Analytics',
              href: '/analytics',
              icon: 'bar-chart',
              category: 'analytics'
            });
          }
          break;
      }
    }

    return navigation;
  }

  /**
   * Check if user has admin access
   */
  private hasAdminAccess(): boolean {
    return this.context?.user.role === 'admin' || this.context?.user.role === 'master_admin';
  }

  /**
   * Check if user has analytics access
   */
  private hasAnalyticsAccess(): boolean {
    const userRole = this.context?.user.role;
    return userRole === 'admin' || userRole === 'master_admin' || userRole === 'company';
  }

  /**
   * Simple hash function for rollout calculations
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Refresh modules and feature flags (for admin changes)
   */
  async refresh(): Promise<void> {
    if (!this.context) return;

    this.loadedModules.clear();
    this.featureFlags.clear();
    
    await this.initialize(this.context.user, this.context.company);
  }

  /**
   * Get current plugin context
   */
  getContext(): PluginContext | null {
    return this.context;
  }
}