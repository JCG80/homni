
import { supabase } from "@/integrations/supabase/client";

/**
 * Selects a provider based on category expertise matching.
 * 
 * This strategy matches lead categories with company expertise profiles
 * by checking if the company's tags include the lead category.
 *
 * @param category - The category of the lead to be assigned
 * @returns Promise<string | null> - Company ID or null if no match found
 */
export async function selectProviderByCategory(category: string): Promise<string | null> {
  if (!category) {
    console.error("Category is required for category matching strategy");
    return null;
  }

  try {
    // For now, we're adapting to use the existing leads table since we don't have 
    // a company_profiles table with tags. In a real implementation, this would query
    // the company_profiles table with a tags filter.
    
    // Query leads with the same category and get the company_id
    const { data: leads, error } = await supabase
      .from('leads')
      .select('company_id, category')
      .eq('category', category)
      .not('company_id', 'is', null)
      .order('updated_at', { ascending: true }) // Load balancing
      .limit(1);
    
    if (error) {
      console.error('Error finding provider by category:', error);
      return null;
    }
    
    // If we found a matching company, return their ID
    if (leads && leads.length > 0 && leads[0].company_id) {
      // In a real implementation, we would update a last_lead_assigned_at timestamp
      return leads[0].company_id;
    }
    
    console.log(`No provider found for category: ${category}`);
    return null;
  } catch (err) {
    console.error('Unexpected error in category matching:', err);
    return null;
  }
}

/**
 * Future implementation when company_profiles table with tags is available:
 * 
 * async function selectProviderByCategory(category: string): Promise<string | null> {
 *   if (!category) return null;
 *   
 *   const { data: companies, error } = await supabase
 *     .from('company_profiles')
 *     .select('id, tags')
 *     .eq('status', 'active');
 *   
 *   if (error) return null;
 *   
 *   const matchingCompany = companies?.find((company) => 
 *     company.tags?.includes(category)
 *   );
 *   
 *   return matchingCompany?.id ?? null;
 * }
 */
