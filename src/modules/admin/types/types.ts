
import { Json } from '@/integrations/supabase/types';

/**
 * Admin module types
 */

export interface Module {
  id: string;
  name: string;
  description: string;
}

export interface CompanyProfile {
  id: string;
  user_id?: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  subscription_plan?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  modules_access?: string[];
  tags?: string[];
  metadata?: Record<string, any> | Json;
  // Statistics fields
  leadsWonPercentage?: number;
  avgResponseTime?: string;
  customerRating?: number;
  monthlyTrend?: string;
  // Additional fields from CompaniesManagementPage
  leads_bought?: number;
  leads_won?: number;
  leads_lost?: number;
  ads_bought?: number;
  accounts?: any;
}

export interface ModuleAccessManagerProps {
  userId: string;
  onUpdate?: () => void;
}

// Member interface for MembersManagementPage
export interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  request_count: number;
  last_active: string;
  lastLogin?: string;
  joined?: string;
}
