
import { supabase } from "@/integrations/supabase/client";
import { DistributionStrategy } from "../strategies/strategyFactory";

/**
 * Gets the current lead distribution strategy from settings
 * @param companyId Optional company ID to get company-specific strategy
 * @returns Promise with the current strategy
 */
export async function getCurrentStrategy(companyId?: string): Promise<DistributionStrategy> {
  try {
    let query = supabase
      .from('lead_settings')
      .select('strategy')
      .order('updated_at', { ascending: false });
    
    // If company ID is provided, get company-specific settings
    if (companyId) {
      query = query.eq('company_id', companyId);
    } else {
      query = query.is('company_id', null); // Get global settings
    }
    
    const { data, error } = await query.limit(1).maybeSingle();
    
    if (error) {
      console.error('Error fetching lead distribution strategy:', error);
      return 'category_match'; // Default fallback
    }
    
    return data?.strategy as DistributionStrategy || 'category_match';
  } catch (err) {
    console.error('Unexpected error in getCurrentStrategy:', err);
    return 'category_match'; // Default fallback on error
  }
}

/**
 * Updates the lead distribution strategy in settings
 * @param strategy The strategy to set as current
 * @param companyId Optional company ID for company-specific settings
 * @returns Promise<boolean> indicating success or failure
 */
export async function updateDistributionStrategy(
  strategy: DistributionStrategy,
  companyId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('lead_settings')
      .insert({
        strategy,
        company_id: companyId || null,
        updated_at: new Date().toISOString(),
        filters: {}
      });
    
    if (error) {
      console.error('Error updating distribution strategy:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in updateDistributionStrategy:', err);
    return false;
  }
}
