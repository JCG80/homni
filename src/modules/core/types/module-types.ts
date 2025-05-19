
/**
 * Module Metadata Types
 * Defines the structure for module definitions in the system
 */

import { UserRole } from '../../auth/utils/roles/types';

/**
 * Core module metadata interface
 */
export interface ModuleMetadata {
  /** Unique identifier for the module */
  id: string;
  
  /** Display name for the module */
  name: string;
  
  /** Detailed description of module functionality */
  description: string;
  
  /** Version following semantic versioning */
  version: string;
  
  /** Whether the module is currently active */
  active: boolean;
  
  /** IDs of other modules this module depends on */
  dependencies: string[];
  
  /** Feature flags that control this module's behavior */
  feature_flags?: string[];
  
  /** Route path for the module */
  route?: string;
  
  /** Icon identifier for UI display */
  icon?: string;
  
  /** Extended metadata for additional configuration */
  extended_metadata?: Record<string, any>;
}

/**
 * Interface for registering a module in the system
 */
export interface RegisterModuleOptions extends ModuleMetadata {
  /** User roles allowed to access this module */
  rolesAllowed: UserRole[];
  
  /** Function that determines if module is enabled for current user */
  isEnabled?: () => boolean | Promise<boolean>;
  
  /** Permission setup function */
  setupPermissions?: () => void;
}

/**
 * Interface for module instance
 */
export interface Module extends ModuleMetadata {
  /** Initialize the module */
  initialize?: () => Promise<void>;
  
  /** Clean up module resources */
  cleanup?: () => Promise<void>;
  
  /** Get module access requirements */
  getAccessRequirements?: () => {
    minRole: UserRole;
    requiredPermissions: string[];
  };
  
  /** Components provided by this module */
  components?: Record<string, React.ComponentType<any>>;
  
  /** Hooks provided by this module */
  hooks?: Record<string, Function>;
  
  /** API functions provided by this module */
  api?: Record<string, Function>;
}

/**
 * Interface for plugin modules that extend the core system
 */
export interface PluginModule extends Module {
  /** Plugin entry point */
  entry: string;
  
  /** Whether the plugin is currently enabled */
  enabled: boolean;
  
  /** Plugin author information */
  author?: string;
  
  /** Plugin homepage URL */
  homepage?: string;
  
  /** Plugin settings schema */
  settingsSchema?: Record<string, any>;
}
