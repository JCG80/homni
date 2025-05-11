
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
  
  // Additional UI properties
  active?: boolean; // Used for UI display purposes
}
