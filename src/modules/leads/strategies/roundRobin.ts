
import { supabase } from "@/integrations/supabase/client";

/**
 * Selects a provider using a simple round-robin distribution strategy.
 * 
 * This strategy finds the provider who hasn't received a lead for the longest time
 * and assigns the new lead to them.
 *
 * @returns Promise<string | null> - Provider ID or null if no providers found
 */
export async function selectProviderByRoundRobin(): Promise<string | null> {
  try {
    // Query active company profiles for round-robin selection
    const { data: companies, error } = await supabase
      .from('company_profiles')
      .select('id, name, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: true });
    
    if (error) {
      console.error('Error finding active companies for round robin:', error);
      return null;
    }
    
    if (!companies || companies.length === 0) {
      console.log('No active companies found for round robin assignment');
      return fallbackRoundRobin();
    }
    
    // Find company that received a lead longest ago by checking lead assignments
    const { data: lastAssignments, error: assignmentError } = await supabase
      .from('leads')
      .select('company_id, updated_at')
      .not('company_id', 'is', null)
      .in('company_id', companies.map(c => c.id))
      .order('updated_at', { ascending: false });
    
    if (assignmentError) {
      console.error('Error querying lead assignments:', assignmentError);
      // Fallback to first active company
      return companies[0].id;
    }
    
    // Find the company that hasn't received a lead for the longest time
    let selectedCompany = companies[0]; // Default to first company
    
    if (lastAssignments && lastAssignments.length > 0) {
      // Create a map of company_id to last assignment time
      const assignmentMap = new Map();
      lastAssignments.forEach(assignment => {
        if (!assignmentMap.has(assignment.company_id)) {
          assignmentMap.set(assignment.company_id, assignment.updated_at);
        }
      });
      
      // Find company with oldest assignment or no assignments
      let oldestDate = new Date();
      for (const company of companies) {
        const lastAssignment = assignmentMap.get(company.id);
        if (!lastAssignment) {
          // Company has never received a lead - prioritize it
          selectedCompany = company;
          break;
        }
        const assignmentDate = new Date(lastAssignment);
        if (assignmentDate < oldestDate) {
          oldestDate = assignmentDate;
          selectedCompany = company;
        }
      }
    }
    
    console.log(`Round-robin selected company: ${selectedCompany.name} (${selectedCompany.id})`);
    return selectedCompany.id;
  } catch (err) {
    console.error('Unexpected error in round robin selection:', err);
    return null;
  }
}

/**
 * Fallback round-robin using leads table when company_profiles unavailable
 */
async function fallbackRoundRobin(): Promise<string | null> {
  try {
    console.log('Using fallback round-robin from leads table');
    const { data: leads, error } = await supabase
      .from('leads')
      .select('company_id')
      .not('company_id', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(1);
    
    if (error || !leads || leads.length === 0) {
      console.log('No providers found in fallback round robin');
      return null;
    }
    
    return leads[0].company_id;
  } catch (err) {
    console.error('Error in fallback round robin:', err);
    return null;
  }
}
