
import { supabase } from "@/integrations/supabase/client";

/**
 * Selects a provider based on category expertise matching.
 * 
 * This strategy matches lead categories with provider expertise profiles
 * and returns the best matching provider's ID.
 *
 * @param category - The category of the lead to be assigned
 * @returns Promise<string | null> - Provider ID or null if no match found
 */
export async function selectProviderByCategory(category: string): Promise<string | null> {
  if (!category) {
    console.error("Category is required for category matching strategy");
    return null;
  }

  try {
    // Query providers who handle this category
    // Note: This assumes you have a providers table with a categories array column
    // or a provider_categories junction table
    const { data: providers, error } = await supabase
      .from('providers')
      .select('id, name, categories')
      .contains('categories', [category])
      .order('last_lead_assigned_at', { ascending: true }) // Load balancing
      .limit(1);
    
    if (error) {
      console.error('Error finding provider by category:', error);
      return null;
    }
    
    // If we found a matching provider, return their ID
    if (providers && providers.length > 0) {
      // Update the last_lead_assigned_at timestamp for this provider
      await supabase
        .from('providers')
        .update({ last_lead_assigned_at: new Date().toISOString() })
        .eq('id', providers[0].id);
      
      return providers[0].id;
    }
    
    console.log(`No provider found for category: ${category}`);
    return null;
  } catch (err) {
    console.error('Unexpected error in category matching:', err);
    return null;
  }
}
