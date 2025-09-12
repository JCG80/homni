/**
 * Canonical Company Profile types
 * This is the single source of truth for all company-related interfaces
 */

/**
 * Enhanced company profile interface combining database schema with business logic
 */
export interface CompanyProfile {
  // Core identification
  id: string;
  user_id?: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  contact_email?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  
  // Business categorization
  industry?: string;
  subscription_plan?: string;
  modules_access?: string[];
  status?: string;
  tags?: string[];
  
  // Timestamps
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  
  // Budget-related fields (from admin types)
  current_budget?: number;
  daily_budget?: number;
  monthly_budget?: number;
  lead_cost_per_unit?: number;
  auto_accept_leads?: boolean;
  budget_alerts_enabled?: boolean;
  low_budget_threshold?: number;
  
  // Statistics fields (from admin types)
  leads_bought?: number;
  leads_won?: number;
  leads_lost?: number;
  ads_bought?: number;
  leadsWonPercentage?: number;
  avgResponseTime?: string;
  customerRating?: number;
  monthlyTrend?: string;
  request_count?: number;
  last_active?: string;
  admin_notes?: string;
  
  // Configuration and preferences (from unified types)
  metadata?: Record<string, any>;
  notification_preferences?: Record<string, any>;
  ui_preferences?: Record<string, any>;
  feature_overrides?: Record<string, any>;
}

/**
 * Company statistics interface for reporting and analytics
 */
export interface CompanyStatistics {
  leads_total: number;
  leads_converted: number;
  conversion_rate: number;
  average_response_time?: number;
}

/**
 * Purchase record interface for company transactions
 */
export interface PurchaseRecord {
  id: string;
  product_name: string;
  amount: number;
  status: string;
  purchase_date: string;
}

/**
 * Analytics interfaces for company dashboard
 */
export interface CompanyMetrics {
  totalLeads: number;
  revenue: number;
  customerAcquisitionCost: number;
  responseTime: number;
  activeUsers: number;
}

export interface LeadSource {
  name: string;
  count: number;
  conversion_rate: number;
}

export interface RegionalData {
  region: string;
  leads: number;
  revenue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface PipelineData {
  stage: string;
  count: number;
  value: number;
}