
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
    // Query company_profiles table for companies with matching tags
    // Using type assertion to avoid TypeScript errors until Supabase types are updated
    const { data: companies, error } = await (supabase
      .from('company_profiles') as any)
      .select('id, tags')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error finding provider by category:', error);
      return null;
    }
    
    // Find companies matching category with scoring system
    const scoredMatches = companies
      ?.map((company) => ({
        company,
        score: calculateCategoryScore(company.tags || [], category)
      }))
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score); // Highest score first
    
    const matchingCompany = scoredMatches?.[0]?.company;
    
    if (matchingCompany) {
      console.log(`Found provider ${matchingCompany.id} matching category: ${category}`);
      return matchingCompany.id;
    }
    
    console.log(`No provider found for category: ${category}`);
    
    // If no match found by tags, fall back to the old method
    return fallbackCategoryMatch(category);
  } catch (err) {
    console.error('Unexpected error in category matching:', err);
    return null;
  }
}

/**
 * Calculate matching score for a category against company tags
 * @param tags Company's expertise tags
 * @param category Lead category to match
 * @returns number Score (0 = no match, higher = better match)
 */
function calculateCategoryScore(tags: string[], category: string): number {
  if (!tags || tags.length === 0 || !category) return 0;
  
  const categoryLower = category.toLowerCase();
  let score = 0;
  
  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    
    // Exact match - highest score
    if (tagLower === categoryLower) {
      score += 100;
    }
    // Category contains tag or tag contains category - good match
    else if (tagLower.includes(categoryLower) || categoryLower.includes(tagLower)) {
      score += 50;
    }
    // Partial similarity based on word matching - moderate match
    else {
      const categoryWords = categoryLower.split(/\s+|[-_]/);
      const tagWords = tagLower.split(/\s+|[-_]/);
      
      for (const catWord of categoryWords) {
        for (const tagWord of tagWords) {
          if (catWord.length > 2 && tagWord.length > 2) {
            if (catWord === tagWord) score += 20;
            else if (catWord.includes(tagWord) || tagWord.includes(catWord)) score += 10;
          }
        }
      }
    }
  }
  
  return score;
}

/**
 * Fallback method that uses the leads table when no match is found
 * in the company_profiles table. This ensures backward compatibility.
 */
async function fallbackCategoryMatch(category: string): Promise<string | null> {
  try {
    console.log(`Using fallback category matching for: ${category}`);
    const { data: leads, error } = await supabase
      .from('leads')
      .select('company_id, category')
      .eq('category', category)
      .not('company_id', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(1);
    
    if (error) {
      console.error('Error in fallback category matching:', error);
      return null;
    }
    
    if (leads && leads.length > 0 && leads[0].company_id) {
      console.log(`Using fallback method, found provider: ${leads[0].company_id}`);
      return leads[0].company_id;
    }
    
    return null;
  } catch (err) {
    console.error('Error in fallback category matching:', err);
    return null;
  }
}
