
export interface SystemModule {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  requires_role?: string[];
  created_at: string;
  updated_at: string;
  
  // Additional properties needed for SystemMapPage - these are used for UI display
  // but aren't part of the actual database schema
  active?: boolean; // Used for UI display purposes
  dependencies?: string[]; // For mapping dependencies between modules
  route?: string; // Navigation route for the module
}
