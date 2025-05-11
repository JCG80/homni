
// Import and re-export from the services file to avoid duplication
import { 
  getSystemModules,
  toggleSystemModule,
  getModuleDependencies,
  createSystemModule,
  deleteSystemModule
} from '../services/systemModules';
import type { SystemModule } from '../types/systemTypes';

export {
  getSystemModules,
  toggleSystemModule,
  getModuleDependencies,
  createSystemModule,
  deleteSystemModule
};

// Export the type separately with 'export type' syntax
export type { SystemModule };
