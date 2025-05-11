
// Import and re-export from the services file to avoid duplication
import { 
  getSystemModules,
  toggleSystemModule,
  getModuleDependencies,
  createSystemModule,
  deleteSystemModule
} from '../services/systemModules';

export {
  getSystemModules,
  toggleSystemModule,
  getModuleDependencies,
  createSystemModule,
  deleteSystemModule
};
