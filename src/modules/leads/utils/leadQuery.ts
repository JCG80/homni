
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/utils/apiRetry";
import { mapToEmojiStatus } from "@/types/leads";

/**
 * Fetches unassigned leads based on the provided filters
 * @param options Options for filtering leads
 * @returns Array of unassigned leads
 */
export async function fetchUnassignedLeads(options: {
  leadType?: string;
}): Promise<any[]> {
  const { leadType } = options;
  
  // Build query for unassigned leads
  let query = supabase
    .from('leads')
    .select('*')
    .eq('status', mapToEmojiStatus('new') as any)
    .is('company_id', null);
  
  // Filter by lead type if specified
  if (leadType) {
    query = query.eq('lead_type', leadType);
  }
  
  // Execute query with retry
  const { data: unassignedLeads, error } = await withRetry(
    async () => await query,
    {
      maxAttempts: 3,
      delayMs: 800,
      backoffFactor: 1.5,
      onRetry: (attempt) => console.log(`Retrying lead fetch (attempt ${attempt})`)
    }
  );
  
  if (error) {
    console.error('Error fetching unassigned leads:', error);
    throw error;
  }
  
  return unassignedLeads || [];
}
