
import { Json } from "@/integrations/supabase/types";

// Base lead settings that match our core type requirements
export interface LeadSettings {
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
  
  // Properties from base LeadSettings type
  paused: boolean;
  categories: string[];
  zipCodes?: string[];
}

// Conversion function to map DB model to our type
export function mapDbToLeadSettings(data: any): LeadSettings {
  return {
    id: data.id,
    strategy: data.strategy,
    globally_paused: data.globally_paused,
    global_pause: data.global_pause,
    agents_paused: data.agents_paused,
    filters: data.filters || { categories: [], zipCodes: [] },
    budget: data.budget,
    daily_budget: data.daily_budget,
    monthly_budget: data.monthly_budget,
    updated_at: data.updated_at,
    
    // Map to the base type properties
    paused: data.globally_paused || data.global_pause,
    categories: data.filters?.categories || [],
    zipCodes: data.filters?.zipCodes || []
  };
}
