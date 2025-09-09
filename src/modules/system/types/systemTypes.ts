
// Consolidated types for system module
export interface SystemModule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  dependencies?: string[];
  route?: string | null;
  icon?: string | null;
  category?: string;
  sort_order?: number;
  
  // Additional UI properties
  active?: boolean; // Used for UI display purposes
}

export interface CategorizedModules {
  [category: string]: SystemModule[];
}

export interface UserModuleAccess {
  id: string;
  name: string;
  description: string | null;
  route: string | null;
  icon: string | null;
  category: string;
  sort_order: number;
  is_enabled: boolean;
}
