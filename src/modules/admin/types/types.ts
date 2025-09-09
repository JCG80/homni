
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

export interface CompanyProfile {
  id: string;
  user_id?: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  subscription_plan?: string;
  modules_access?: string[];
  admin_notes?: string;
  request_count?: number;
  last_active?: string;
  
  // Budget-related fields
  current_budget?: number;
  daily_budget?: number;
  monthly_budget?: number;
  lead_cost_per_unit?: number;
  auto_accept_leads?: boolean;
  budget_alerts_enabled?: boolean;
  low_budget_threshold?: number;
  
  // Statistics fields
  leads_bought?: number;
  leads_won?: number;
  leads_lost?: number;
  ads_bought?: number;
  leadsWonPercentage?: number;
  avgResponseTime?: string;
  customerRating?: number;
  monthlyTrend?: string;
}

export interface PurchaseRecord {
  id: string;
  product_name: string;
  amount: number;
  status: string;
  purchase_date: string;
}

export interface CompanyStatistics {
  leads_total: number;
  leads_converted: number;
  conversion_rate: number;
  average_response_time?: number;
}

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
