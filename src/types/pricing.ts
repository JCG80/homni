// Pricing and marketplace types
export interface PricingTier {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  base_price_cents: number;
  preview_access_level: 'none' | 'basic' | 'contact' | 'full';
  full_access_price_multiplier: number;
  time_limit_hours: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadPricing {
  tier_name: string;
  base_price_cents: number;
  preview_access_level: string;
  full_price_cents: number;
  score: number;
}

export interface QualityFactors {
  completeness: number;
  urgency: number;
  budget_indicator: number;
  location: number;
  category_demand: number;
  contact_quality: number;
}

export interface PricingCalculation {
  base_price: number;
  quality_multiplier: number;
  demand_multiplier: number;
  final_price: number;
  tier: string;
}

export const TIER_COLORS: Record<string, string> = {
  platinum: 'hsl(var(--violet-500))',
  gold: 'hsl(var(--amber-500))',
  silver: 'hsl(var(--slate-400))',
  bronze: 'hsl(var(--amber-700))',
  basic: 'hsl(var(--muted-foreground))'
};

export const SCORE_GRADES: Record<string, { min: number; max: number; color: string }> = {
  'A+': { min: 86, max: 100, color: 'hsl(var(--success))' },
  'A': { min: 76, max: 85, color: 'hsl(var(--success))' },
  'B': { min: 61, max: 75, color: 'hsl(var(--primary))' },
  'C': { min: 46, max: 60, color: 'hsl(var(--warning))' },
  'D': { min: 31, max: 45, color: 'hsl(var(--destructive))' },
  'F': { min: 0, max: 30, color: 'hsl(var(--destructive))' }
};