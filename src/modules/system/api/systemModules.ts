
// Import and re-export from the services file to avoid duplication
import { 
  getSystemModules,
  toggleSystemModule,
  getModuleDependencies,
  createSystemModule,
  deleteSystemModule
} from '../services/systemModules';
import { SystemModule } from '../types/systemTypes';

export {
  getSystemModules,
  toggleSystemModule,
  getModuleDependencies,
  createSystemModule,
  deleteSystemModule,
  SystemModule // Export the type
};
