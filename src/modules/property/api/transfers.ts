
import { supabase } from '@/integrations/supabase/client';
import { handlePropertyApiError, showSuccessToast } from './base';

/**
 * Transfer property ownership to another user
 */
export const transferProperty = async (propertyId: string, newOwnerId: string, notes?: string): Promise<boolean> => {
  const user = supabase.auth.getUser();
  if (!user) {
    return false;
  }
  
  try {
    // Fetch the current property first to ensure user is the owner
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .maybeSingle();
      
    if (fetchError || !property) {
      console.error("Error fetching property for transfer:", fetchError);
      return false;
    }
    
    // Start a transaction for transferring the property
    // 1. Update property ownership
    const { error: updateError } = await supabase
      .from('properties')
      .update({ user_id: newOwnerId })
      .eq('id', propertyId);
      
    if (updateError) {
      console.error("Error updating property ownership:", updateError);
      return false;
    }
    
    // 2. Record the transfer
    const { error: transferError } = await supabase
      .from('property_transfers')
      .insert([{
        property_id: propertyId,
        previous_owner_id: property.user_id,
        new_owner_id: newOwnerId,
        notes
      }]);
      
    if (transferError) {
      console.error("Error recording property transfer:", transferError);
      return false;
    }
    
    showSuccessToast(
      "Eiendom overført",
      "Eiendommen ble overført til ny eier."
    );
    
    return true;
  } catch (error) {
    handlePropertyApiError(error, "overføre eiendom");
    return false;
  }
};
