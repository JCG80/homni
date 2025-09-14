
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LeadStatus } from "@/types/leads-canonical";

/**
 * Manually assigns a lead to a specific company
 * 
 * @param leadId The ID of the lead to assign
 * @param companyId The ID of the company to assign the lead to
 * @param assignedBy ID of the admin user making the assignment
 * @returns Promise with the result of the operation
 */
export const assignLeadToCompany = async (
  leadId: string, 
  companyId: string,
  assignedBy?: string
): Promise<boolean> => {
  try {
    // First get the current lead status
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching lead for assignment:', fetchError);
      return false;
    }
    
    const previousStatus = lead.status;
    const assignedStatus = 'qualified'; // Map assigned to qualified
    
    // Update the lead with the new company_id and status
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        company_id: companyId,
        status: assignedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);
    
    if (updateError) {
      console.error('Error assigning lead:', updateError);
      toast({
        title: "Kunne ikke tildele lead",
        description: "Det oppstod en feil ved tildeling av lead.",
        variant: "destructive",
      });
      return false;
    }
    
    // Log the manual assignment in lead_history
    const { error: historyError } = await supabase
      .from('lead_history')
      .insert({
        lead_id: leadId,
        assigned_to: companyId,
        method: 'manual',
        previous_status: previousStatus,
        new_status: assignedStatus,
        created_by: assignedBy
      });
    
    if (historyError) {
      console.error('Error logging lead assignment history:', historyError);
      // Continue anyway since the main operation succeeded
    }
    
    toast({
      title: "Lead tildelt",
      description: "Lead har blitt tildelt til bedriften.",
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error in assignLeadToCompany:', error);
    toast({
      title: "Feil ved tildeling",
      description: "En uventet feil oppstod under tildeling av lead.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Updates the status of a lead that has been assigned to a company
 * 
 * @param leadId The ID of the lead to update status for
 * @param newStatus The new status (in_progress, won, lost, etc.)
 * @param updatedBy ID of the user making the update
 * @returns Promise with the result of the operation
 */
export const updateLeadStatus = async (
  leadId: string,
  newStatus: LeadStatus,
  updatedBy?: string
): Promise<boolean> => {
  try {
    // First get the current lead status
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('status, company_id')
      .eq('id', leadId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching lead for status update:', fetchError);
      return false;
    }
    
    const previousStatus = lead.status;
    const dbStatus = newStatus; // Use clean status directly
    
    // Update the lead status
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);
    
    if (updateError) {
      console.error('Error updating lead status:', updateError);
      toast({
        title: "Kunne ikke oppdatere status",
        description: "Det oppstod en feil ved oppdatering av lead-status.",
        variant: "destructive",
      });
      return false;
    }
    
    // Log the status update in lead_history
    const { error: historyError } = await supabase
      .from('lead_history')
      .insert({
        lead_id: leadId,
        assigned_to: lead.company_id,
        method: 'status_update',
        previous_status: previousStatus,
        new_status: dbStatus,
        created_by: updatedBy
      });
    
    if (historyError) {
      console.error('Error logging lead status update history:', historyError);
      // Continue anyway since the main operation succeeded
    }
    
    toast({
      title: "Status oppdatert",
      description: `Lead-status er nå satt til ${newStatus}.`,
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error in updateLeadStatus:', error);
    toast({
      title: "Feil ved statusoppdatering",
      description: "En uventet feil oppstod under oppdatering av lead-status.",
      variant: "destructive",
    });
    return false;
  }
};
