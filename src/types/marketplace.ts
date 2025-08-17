/**
 * Marketplace and buyer-related types
 */

/**
 * Lead package interface
 */
export interface LeadPackage {
  id: string;
  name: string;
  description?: string;
  price_per_lead: number;
  monthly_price?: number;
  lead_cap_per_day?: number;
  lead_cap_per_month?: number;
  priority_level?: number;
  features?: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Buyer account interface
 */
export interface BuyerAccount {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  current_budget?: number;
  daily_budget?: number;
  monthly_budget?: number;
  auto_recharge?: boolean;
  pause_when_budget_exceeded?: boolean;
  preferred_categories?: string[];
  geographical_scope?: string[];
  billing_address?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Buyer package subscription interface
 */
export interface BuyerPackageSubscription {
  id: string;
  buyer_id: string;
  package_id: string;
  status: 'active' | 'paused' | 'cancelled';
  auto_buy?: boolean;
  daily_cap_cents?: number;
  monthly_cap_cents?: number;
  is_paused?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Lead assignment interface
 */
export interface LeadAssignment {
  id: string;
  lead_id: string;
  buyer_id: string;
  cost: number;
  assigned_at?: string;
  auto_purchased_at?: string;
  completed_at?: string;
  expires_at?: string;
  accepted_at?: string;
  pipeline_stage?: '📥 new' | '🚀 in_progress' | '🏆 won' | '❌ lost';
  status?: string;
  buyer_notes?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Lead assignment history interface
 */
export interface LeadAssignmentHistory {
  id: string;
  assignment_id: string;
  changed_by?: string;
  previous_stage?: string;
  new_stage?: string;
  notes?: string;
  changed_at?: string;
}

/**
 * Buyer spend ledger interface
 */
export interface BuyerSpendLedger {
  id: string;
  buyer_id: string;
  assignment_id?: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

/**
 * Lead distribution options
 */
export interface LeadDistributionOptions {
  leadId: string;
  packageId?: string;
  buyerId?: string;
  forceDistribute?: boolean;
}

/**
 * Auto purchase result interface
 */
export interface AutoPurchaseResult {
  assignment_id: string;
  buyer_id: string;
  cost: number;
  success: boolean;
  error?: string;
}

/**
 * Pipeline stage enum
 */
export type PipelineStage = '📥 new' | '🚀 in_progress' | '🏆 won' | '❌ lost';

/**
 * Available pipeline stages
 */
export const PIPELINE_STAGES: PipelineStage[] = [
  '📥 new',
  '🚀 in_progress', 
  '🏆 won',
  '❌ lost'
];

/**
 * Marketplace statistics interface
 */
export interface MarketplaceStats {
  totalLeads: number;
  totalBuyers: number;
  totalRevenue: number;
  averageLeadPrice: number;
  conversionRate: number;
}