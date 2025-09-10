/**
 * Module Registry - Centralized module management following rettningslinjer
 */
import { pluginLoader } from '@/core/plugins/pluginLoader';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  business_domain: 'bytt' | 'boligmappa' | 'propr' | 'core';
  dependencies: string[];
  routes: ModuleRoute[];
  components: ModuleComponent[];
  services: string[];
  permissions: string[];
  feature_flags: string[];
}

export interface ModuleRoute {
  path: string;
  component: string;
  roles: string[];
  exact?: boolean;
}

export interface ModuleComponent {
  name: string;
  type: 'page' | 'widget' | 'modal' | 'utility';
  export_name: string;
}

export class ModuleRegistry {
  private modules = new Map<string, ModuleManifest>();
  private activeModules = new Set<string>();

  /**
   * Register core business modules
   */
  async initializeCoreModules(): Promise<void> {
    const coreModules: ModuleManifest[] = [
      {
        id: 'bytt-lead-engine',
        name: 'Bytt.no Lead Engine',
        version: '1.0.0',
        description: 'Lead generation and comparison engine',
        business_domain: 'bytt',
        dependencies: ['auth', 'database'],
        routes: [
          { path: '/sammenlign', component: 'ComparisonPage', roles: ['guest', 'user'] },
          { path: '/leads', component: 'LeadDashboard', roles: ['company', 'admin'] },
          { path: '/leads/new', component: 'LeadSubmissionForm', roles: ['user'] },
        ],
        components: [
          { name: 'ComparisonEngine', type: 'page', export_name: 'ComparisonEngine' },
          { name: 'LeadKanban', type: 'widget', export_name: 'LeadKanbanWidget' },
          { name: 'QuoteComparison', type: 'widget', export_name: 'QuoteComparisonWidget' },
        ],
        services: ['leadEngineService', 'comparisonService'],
        permissions: ['view_leads', 'create_leads', 'manage_leads'],
        feature_flags: ['lead_distribution', 'auto_quotes'],
      },
      {
        id: 'boligmappa-docs',
        name: 'Boligmappa.no Documentation',
        version: '1.0.0',
        description: 'Property documentation and maintenance tracking',
        business_domain: 'boligmappa',
        dependencies: ['auth', 'storage', 'database'],
        routes: [
          { path: '/boligmappa', component: 'PropertyOverview', roles: ['user'] },
          { path: '/boligmappa/property/:id', component: 'PropertyDetails', roles: ['user'] },
          { path: '/boligmappa/maintenance', component: 'MaintenanceCalendar', roles: ['user'] },
        ],
        components: [
          { name: 'PropertyOverview', type: 'page', export_name: 'PropertyOverview' },
          { name: 'DocumentManager', type: 'widget', export_name: 'DocumentManagerWidget' },
          { name: 'MaintenanceTracker', type: 'widget', export_name: 'MaintenanceTrackerWidget' },
        ],
        services: ['propertyManagementService', 'documentService'],
        permissions: ['view_properties', 'manage_properties', 'upload_documents'],
        feature_flags: ['maintenance_reminders', 'value_tracking'],
      },
      {
        id: 'propr-selling',
        name: 'Propr.no DIY Selling',
        version: '1.0.0',
        description: 'DIY property selling workflow',
        business_domain: 'propr',
        dependencies: ['auth', 'database', 'boligmappa-docs'],
        routes: [
          { path: '/selg-selv', component: 'DIYSellingDashboard', roles: ['user'] },
          { path: '/selg-selv/verdi', component: 'PropertyValuation', roles: ['user'] },
          { path: '/selg-selv/annonse', component: 'ListingCreator', roles: ['user'] },
        ],
        components: [
          { name: 'SellingChecklist', type: 'widget', export_name: 'SellingChecklistWidget' },
          { name: 'MarketAnalysis', type: 'widget', export_name: 'MarketAnalysisWidget' },
          { name: 'CostCalculator', type: 'utility', export_name: 'CostCalculatorWidget' },
        ],
        services: ['diySellingService', 'valuationService'],
        permissions: ['create_listings', 'manage_listings', 'view_market_data'],
        feature_flags: ['ai_descriptions', 'virtual_tours'],
      },
      {
        id: 'smart-start',
        name: 'SmartStart Adaptive Homepage',
        version: '1.0.0',
        description: 'Adaptive search-based homepage for lead generation and onboarding',
        business_domain: 'bytt',
        dependencies: ['auth'],
        routes: [
          { path: '/', component: 'SmartStart', roles: ['guest', 'user', 'company', 'admin'] }
        ],
        components: [
          { name: 'SmartStart', type: 'page', export_name: 'SmartStart' },
          { name: 'SearchProgress', type: 'widget', export_name: 'SearchProgress' },
          { name: 'RoleAdaptiveContent', type: 'widget', export_name: 'RoleAdaptiveContent' }
        ],
        services: ['lead-generation', 'onboarding'],
        permissions: ['guest:access', 'user:access', 'company:access'],
        feature_flags: ['ENABLE_SMART_START']
      },
    ];

    for (const module of coreModules) {
      await this.registerModule(module);
    }
  }

  /**
   * Register module
   */
  async registerModule(manifest: ModuleManifest): Promise<void> {
    // Validate dependencies
    for (const dep of manifest.dependencies) {
      if (!this.isModuleActive(dep) && dep !== 'auth' && dep !== 'database' && dep !== 'storage') {
        console.warn(`Module ${manifest.id} depends on inactive module: ${dep}`);
      }
    }

    // Store module
    this.modules.set(manifest.id, manifest);
    
    // Activate if all dependencies are met
    if (this.areDependenciesMet(manifest)) {
      await this.activateModule(manifest.id);
    }

    console.log(`Module registered: ${manifest.name} v${manifest.version}`);
  }

  /**
   * Activate module
   */
  async activateModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    if (this.activeModules.has(moduleId)) {
      return; // Already active
    }

    // Activate dependencies first
    for (const dep of module.dependencies) {
      if (this.modules.has(dep) && !this.activeModules.has(dep)) {
        await this.activateModule(dep);
      }
    }

    // Mark as active
    this.activeModules.add(moduleId);

    // Initialize module services
    await this.initializeModuleServices(module);

    console.log(`Module activated: ${module.name}`);
  }

  /**
   * Deactivate module
   */
  async deactivateModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module || !this.activeModules.has(moduleId)) {
      return;
    }

    // Check if other modules depend on this one
    const dependentModules = Array.from(this.modules.values())
      .filter(m => m.dependencies.includes(moduleId) && this.activeModules.has(m.id));

    if (dependentModules.length > 0) {
      throw new Error(`Cannot deactivate ${moduleId}: required by ${dependentModules.map(m => m.name).join(', ')}`);
    }

    // Deactivate
    this.activeModules.delete(moduleId);

    // Cleanup module services
    await this.cleanupModuleServices(module);

    console.log(`Module deactivated: ${module.name}`);
  }

  /**
   * Get module routes for routing system
   */
  getModuleRoutes(): ModuleRoute[] {
    const routes: ModuleRoute[] = [];
    
    for (const moduleId of this.activeModules) {
      const module = this.modules.get(moduleId);
      if (module) {
        routes.push(...module.routes);
      }
    }

    return routes;
  }

  /**
   * Get active modules by business domain
   */
  getModulesByDomain(domain: ModuleManifest['business_domain']): ModuleManifest[] {
    return Array.from(this.modules.values())
      .filter(module => module.business_domain === domain && this.activeModules.has(module.id));
  }

  /**
   * Check if module is active
   */
  isModuleActive(moduleId: string): boolean {
    return this.activeModules.has(moduleId);
  }

  /**
   * Get all active modules
   */
  getActiveModules(): ModuleManifest[] {
    return Array.from(this.activeModules)
      .map(id => this.modules.get(id))
      .filter(Boolean) as ModuleManifest[];
  }

  /**
   * Helper methods
   */
  private areDependenciesMet(module: ModuleManifest): boolean {
    return module.dependencies.every(dep => 
      this.isModuleActive(dep) || ['auth', 'database', 'storage'].includes(dep)
    );
  }

  private async initializeModuleServices(module: ModuleManifest): Promise<void> {
    // Initialize services for the module
    for (const service of module.services) {
      try {
        // Dynamic import would happen here in real implementation
        console.log(`Initializing service: ${service} for module ${module.name}`);
      } catch (error) {
        console.error(`Failed to initialize service ${service}:`, error);
      }
    }
  }

  private async cleanupModuleServices(module: ModuleManifest): Promise<void> {
    // Cleanup services for the module
    for (const service of module.services) {
      console.log(`Cleaning up service: ${service} for module ${module.name}`);
    }
  }
}

// Global module registry
export const moduleRegistry = new ModuleRegistry();

// Initialize core modules
export const initializeModules = async (): Promise<void> => {
  await moduleRegistry.initializeCoreModules();
};