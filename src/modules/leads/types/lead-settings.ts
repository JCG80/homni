
import { Json } from "@/integrations/supabase/types";
import { LeadSettings as BaseLeadSettings } from "@/types/leads";

// Extended LeadSettings that includes database fields while maintaining compatibility with base type
export interface LeadSettings extends BaseLeadSettings {
  id: string;
  strategy: string;
  globally_paused: boolean;
  global_pause: boolean;
  agents_paused: boolean;
  filters: {
    categories?: string[];
    zipCodes?: string[];
    [key: string]: Json | undefined;
  };
  budget?: number;
  daily_budget?: number;
  monthly_budget?: number;
  updated_at: string;
}

// Conversion function to map DB model to our type
export function mapDbToLeadSettings(data: any): LeadSettings {
  return {
    id: data.id,
    strategy: data.strategy,
    paused: data.globally_paused || data.global_pause, // Map to the base type's paused field
    globally_paused: data.globally_paused,
    global_pause: data.global_pause,
    agents_paused: data.agents_paused,
    categories: data.filters?.categories || [],
    zipCodes: data.filters?.zipCodes,
    filters: data.filters || { categories: [], zipCodes: [] },
    budget: data.budget,
    daily_budget: data.daily_budget,
    monthly_budget: data.monthly_budget,
    updated_at: data.updated_at
  };
}
