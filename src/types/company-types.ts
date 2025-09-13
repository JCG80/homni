/**
 * Company and billing related types
 */

export interface BudgetStatus {
  current_budget: number;
  daily_budget: number;
  monthly_budget: number;
  daily_spent: number;
  monthly_spent: number;
  remaining_daily: number;
  remaining_monthly: number;
  is_budget_exceeded: boolean;
  next_reset_date: string;
}

export interface SpendingHistory {
  date: string;
  amount: number;
  lead_count: number;
  average_cost: number;
}

export interface BudgetAlert {
  id: string;
  type: 'low_budget' | 'budget_exceeded' | 'high_spending';
  message: string;
  threshold: number;
  current_value: number;
  created_at: string;
}

export interface BudgetSettings {
  daily_budget?: number;
  monthly_budget?: number;
  auto_accept_leads?: boolean;
  budget_alerts_enabled?: boolean;
  low_budget_threshold?: number;
}