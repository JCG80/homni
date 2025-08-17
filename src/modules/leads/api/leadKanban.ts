
import { supabase } from "@/integrations/supabase/client";
import { LeadStatus } from "@/types/leads";
import { toast } from "@/hooks/use-toast";
import { mapToEmojiStatus } from "@/types/leads";

/**
 * Fetch leads for the current user's company
 * Filters leads based on company_id or user_id
 */
export const fetchLeads = async (companyId?: string, userId?: string) => {
  if (!companyId && !userId) {
    throw new Error("Either companyId or userId must be provided");
  }

  let query = supabase
    .from('leads')
    .select('*');
  
  // Filter by company ID if provided
  if (companyId) {
    query = query.eq('company_id', companyId);
  }
  
  // Filter by user ID if provided and no company ID
  if (!companyId && userId) {
    query = query.eq('submitted_by', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching leads:", error);
    toast({
      title: "Feil ved henting av leads",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
  
  return data;
};

/**
 * Update lead status with optimistic update support
 */
export const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ 
        status: mapToEmojiStatus(newStatus as string) as any, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', leadId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error updating lead status:", error);
    toast({
      title: "Feil ved oppdatering av status",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Get lead counts by status for statistics
 */
export const getLeadCountsByStatus = async (companyId?: string, userId?: string) => {
  if (!companyId && !userId) {
    throw new Error("Either companyId or userId must be provided");
  }

  // Initialize counts object
  const counts = {
    new: 0,
    in_progress: 0,
    won: 0,
    lost: 0
  };
  
  try {
    // Query for leads with the specified filters
    let query = supabase
      .from('leads')
      .select('status');
      
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    if (!companyId && userId) {
      query = query.eq('submitted_by', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (data) {
      // Count leads by emoji status and map to legacy buckets
      data.forEach((lead) => {
        switch (lead.status) {
          case '📥 new':
            counts.new++;
            break;
          case '💬 contacted':
          case '📞 negotiating':
          case '👀 qualified':
            counts.in_progress++;
            break;
          case '✅ converted':
            counts.won++;
            break;
          case '❌ lost':
            counts.lost++;
            break;
          default:
            break;
        }
      });
    }
    
    return counts;
  } catch (error: any) {
    console.error("Error counting leads by status:", error);
    return counts; // Return default counts on error
  }
};
