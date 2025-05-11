
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
  metadata?: Record<string, any>;
  // Statistics fields
  leadsWonPercentage?: number;
  avgResponseTime?: string;
  customerRating?: number;
  monthlyTrend?: string;
}

export interface ModuleAccessManagerProps {
  userId: string;
  onUpdate?: () => void;
}

