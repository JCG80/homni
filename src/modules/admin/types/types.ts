
import { Json } from '@/integrations/supabase/types';

export interface AppUser {
  id: string;
  full_name?: string;
  email?: string;
  status?: string;
  request_count?: number;
  last_active?: string;
  created_at?: string;
  modules_access?: string[];
  subscription_plan?: string;
}

// CompanyProfile moved to src/types/company.ts as canonical source
// Re-export from canonical location
export type { CompanyProfile, CompanyStatistics, PurchaseRecord } from '@/types/company';

export interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Json | null;
  created_at: string;
}

export interface ModuleAccessRecord {
  user_id: string;
  system_module_id: string;
  internal_admin?: boolean;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  dependencies?: string[];
  route?: string;
  active?: boolean; // UI display property
}

// ModuleAccessManagerProps moved to @/types/admin to avoid duplication
