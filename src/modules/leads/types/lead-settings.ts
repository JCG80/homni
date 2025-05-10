
import { Json } from "@/integrations/supabase/types";

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
}
