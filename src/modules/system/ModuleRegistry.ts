/**
 * PHASE 1: Pluggable Module Architecture
 * Central registry for all system modules
 * Part of Ultimate Master 2.0 implementation
 */

import type { UserRole } from '@/modules/auth/normalizeRole';

export interface ModuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'core' | 'business' | 'analytics' | 'admin' | 'content';
  dependencies: string[];
  requiredRoles: UserRole[];
  featureFlags?: string[];
  routes?: ModuleRoute[];
  permissions?: ModulePermission[];
  isActive: boolean;
  sortOrder: number;
}

export interface ModuleRoute {
  path: string;
  component: string;
  exact?: boolean;
  roles?: UserRole[];
  featureFlag?: string;
}

export interface ModulePermission {
  action: string;
  resource: string;
  roles: UserRole[];
}

/**
 * Core modules that are always available
 */
export const CORE_MODULES: ModuleMetadata[] = [
  {
    id: 'authentication',
    name: 'Autentisering',
    description: 'Brukerautentisering og autorisasjon',
    version: '1.0.0',
    category: 'core',
    dependencies: [],
    requiredRoles: ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
    isActive: true,
    sortOrder: 1,
    routes: [
      { path: '/login', component: 'LoginPage', roles: ['guest'] },
      { path: '/profile', component: 'ProfilePage', roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'] }
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Personaliserte dashboards',
    version: '1.0.0',
    category: 'core',
    dependencies: ['authentication'],
    requiredRoles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    isActive: true,
    sortOrder: 2,
    routes: [
      { path: '/dashboard', component: 'Dashboard', roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'] }
    ]
  }
];

/**
 * Business modules
 */
export const BUSINESS_MODULES: ModuleMetadata[] = [
  {
    id: 'lead_management',
    name: 'Lead-administrasjon',
    description: 'Administrer kundehenvendelser og leads',
    version: '1.0.0',
    category: 'business',
    dependencies: ['authentication', 'dashboard'],
    requiredRoles: ['company', 'admin', 'master_admin'],
    featureFlags: ['ENABLE_LEAD_MANAGEMENT'],
    isActive: true,
    sortOrder: 10,
    routes: [
      { path: '/leads', component: 'LeadDashboard', roles: ['company', 'admin', 'master_admin'] },
      { path: '/leads/:id', component: 'LeadDetails', roles: ['company', 'admin', 'master_admin'] },
      { path: '/company/leads', component: 'CompanyLeadDashboard', roles: ['company'] }
    ]
  },
  {
    id: 'lead_marketplace',
    name: 'Lead Marketplace',
    description: 'Kjøp og salg av leads',
    version: '1.0.0',
    category: 'business',
    dependencies: ['lead_management'],
    requiredRoles: ['company', 'admin', 'master_admin'],
    featureFlags: ['ENABLE_LEAD_MARKETPLACE'],
    isActive: false, // Behind feature flag
    sortOrder: 11,
    routes: [
      { path: '/marketplace', component: 'LeadMarketplace', roles: ['company', 'admin', 'master_admin'] },
      { path: '/marketplace/packages', component: 'LeadPackages', roles: ['admin', 'master_admin'] }
    ]
  },
  {
    id: 'property_management',
    name: 'Eiendomsadministrasjon',
    description: 'Administrer eiendommer og dokumenter',
    version: '1.0.0',
    category: 'business',
    dependencies: ['authentication'],
    requiredRoles: ['user', 'company', 'admin', 'master_admin'],
    featureFlags: ['ENABLE_PROPERTY_MANAGEMENT'],
    isActive: true,
    sortOrder: 12,
    routes: [
      { path: '/properties', component: 'PropertyDashboard', roles: ['user', 'company', 'admin', 'master_admin'] },
      { path: '/properties/new', component: 'NewPropertyPage', roles: ['user', 'company', 'admin', 'master_admin'] },
      { path: '/properties/:id', component: 'PropertyDetailsPage', roles: ['user', 'company', 'admin', 'master_admin'] }
    ]
  },
  {
    id: 'insurance_comparison',
    name: 'Forsikringssammenligning',
    description: 'Sammenlign forsikringsselskaper og produkter',
    version: '1.0.0',
    category: 'business',
    dependencies: ['authentication'],
    requiredRoles: ['guest', 'user', 'company'],
    isActive: true,
    sortOrder: 13,
    routes: [
      { path: '/forsikring', component: 'InsuranceLanding', roles: ['guest', 'user', 'company'] },
      { path: '/forsikring/selskaper', component: 'PublicCompaniesDirectory', roles: ['guest', 'user', 'company'] }
    ]
  }
];

/**
 * Analytics modules
 */
export const ANALYTICS_MODULES: ModuleMetadata[] = [
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Analyse og rapporter',
    version: '1.0.0',
    category: 'analytics',
    dependencies: ['authentication'],
    requiredRoles: ['admin', 'master_admin', 'company'],
    isActive: true,
    sortOrder: 20,
    routes: [
      { path: '/analytics', component: 'AnalyticsDashboard', roles: ['admin', 'master_admin', 'company'] },
      { path: '/leads/intelligence', component: 'LeadIntelligence', roles: ['admin', 'master_admin', 'company'] }
    ]
  }
];

/**
 * Admin modules
 */
export const ADMIN_MODULES: ModuleMetadata[] = [
  {
    id: 'user_management',
    name: 'Brukeradministrasjon',
    description: 'Administrer brukere og roller',
    version: '1.0.0',
    category: 'admin',
    dependencies: ['authentication'],
    requiredRoles: ['admin', 'master_admin'],
    isActive: true,
    sortOrder: 30,
    routes: [
      { path: '/admin/users', component: 'UserManagement', roles: ['admin', 'master_admin'] },
      { path: '/admin/roles', component: 'RoleManagement', roles: ['master_admin'] }
    ]
  },
  {
    id: 'company_management',
    name: 'Bedriftsadministrasjon',
    description: 'Administrer bedriftsprofiler',
    version: '1.0.0',
    category: 'admin',
    dependencies: ['authentication', 'user_management'],
    requiredRoles: ['admin', 'master_admin'],
    isActive: true,
    sortOrder: 31
  },
  {
    id: 'system_management',
    name: 'Systemadministrasjon',
    description: 'Systemkonfigurasjon og overvåking',
    version: '1.0.0',
    category: 'admin',
    dependencies: ['authentication'],
    requiredRoles: ['master_admin'],
    isActive: true,
    sortOrder: 32
  },
  {
    id: 'module_management',
    name: 'Moduladministrasjon',
    description: 'Administrer systemmoduler',
    version: '1.0.0',
    category: 'admin',
    dependencies: ['authentication'],
    requiredRoles: ['master_admin'],
    isActive: true,
    sortOrder: 33
  },
  {
    id: 'feature_management',
    name: 'Feature Flag-administrasjon',
    description: 'Administrer funksjonsbrytere',
    version: '1.0.0',
    category: 'admin',
    dependencies: ['authentication'],
    requiredRoles: ['master_admin'],
    isActive: true,
    sortOrder: 34
  }
];

/**
 * Content modules
 */
export const CONTENT_MODULES: ModuleMetadata[] = [
  {
    id: 'content_management',
    name: 'Innholdsadministrasjon',
    description: 'Administrer artikler og sider',
    version: '1.0.0',
    category: 'content',
    dependencies: ['authentication'],
    requiredRoles: ['content_editor', 'admin', 'master_admin'],
    isActive: true,
    sortOrder: 40
  }
];

/**
 * Module Registry - Central registry for all modules
 */
class ModuleRegistry {
  private modules: Map<string, ModuleMetadata> = new Map();

  constructor() {
    this.registerModules([
      ...CORE_MODULES,
      ...BUSINESS_MODULES,
      ...ANALYTICS_MODULES,
      ...ADMIN_MODULES,
      ...CONTENT_MODULES
    ]);
  }

  /**
   * Register modules in the registry
   */
  private registerModules(modules: ModuleMetadata[]): void {
    modules.forEach(module => {
      this.modules.set(module.id, module);
    });
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ModuleMetadata[] {
    return Array.from(this.modules.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get active modules only
   */
  getActiveModules(): ModuleMetadata[] {
    return this.getAllModules().filter(module => module.isActive);
  }

  /**
   * Get modules available for a specific role
   */
  getModulesForRole(role: UserRole): ModuleMetadata[] {
    return this.getActiveModules().filter(module => 
      module.requiredRoles.includes(role)
    );
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: ModuleMetadata['category']): ModuleMetadata[] {
    return this.getActiveModules().filter(module => module.category === category);
  }

  /**
   * Get a specific module
   */
  getModule(id: string): ModuleMetadata | undefined {
    return this.modules.get(id);
  }

  /**
   * Check if a module is available for a role
   */
  isModuleAvailable(moduleId: string, role: UserRole): boolean {
    const module = this.getModule(moduleId);
    if (!module || !module.isActive) return false;
    return module.requiredRoles.includes(role);
  }

  /**
   * Get all routes from active modules for a role
   */
  getRoutesForRole(role: UserRole): ModuleRoute[] {
    return this.getModulesForRole(role)
      .flatMap(module => module.routes || [])
      .filter(route => !route.roles || route.roles.includes(role));
  }

  /**
   * Validate module dependencies
   */
  validateDependencies(moduleId: string): { valid: boolean; missing: string[] } {
    const module = this.getModule(moduleId);
    if (!module) return { valid: false, missing: [] };

    const missing = module.dependencies.filter(dep => {
      const depModule = this.getModule(dep);
      return !depModule || !depModule.isActive;
    });

    return { valid: missing.length === 0, missing };
  }

  /**
   * Toggle module active state
   */
  toggleModule(moduleId: string, isActive: boolean): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;

    // Check if deactivating would break dependencies
    if (!isActive) {
      const dependents = this.getAllModules().filter(m => 
        m.dependencies.includes(moduleId) && m.isActive
      );
      
      if (dependents.length > 0) {
        console.warn(`Cannot deactivate ${moduleId}: required by`, dependents.map(m => m.id));
        return false;
      }
    }

    module.isActive = isActive;
    this.modules.set(moduleId, module);
    return true;
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();

// Export helper functions
export function getModulesForRole(role: UserRole): ModuleMetadata[] {
  return moduleRegistry.getModulesForRole(role);
}

export function isModuleAvailable(moduleId: string, role: UserRole): boolean {
  return moduleRegistry.isModuleAvailable(moduleId, role);
}

export function getAllActiveModules(): ModuleMetadata[] {
  return moduleRegistry.getActiveModules();
}