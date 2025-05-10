
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyDocument, PropertyExpense, PropertyType } from '../types/propertyTypes';
import { toast } from '@/hooks/use-toast';

/**
 * Fetch properties for the current user
 */
export const getUserProperties = async (): Promise<Property[]> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user properties:", error);
      toast({
        title: "Feil ved henting av eiendommer",
        description: "Kunne ikke hente eiendommene dine. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
      return [];
    }
    
    // Ensure we're returning properly typed data
    return data?.map(item => ({
      ...item,
      type: item.type as PropertyType
    })) || [];
  } catch (error) {
    console.error("Unexpected error fetching properties:", error);
    return [];
  }
};

/**
 * Fetch a single property by ID
 */
export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching property:", error);
      return null;
    }
    
    return data ? { ...data, type: data.type as PropertyType } : null;
  } catch (error) {
    console.error("Unexpected error fetching property:", error);
    return null;
  }
};

/**
 * Create a new property
 */
export const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Feil ved oppretting",
        description: "Kunne ikke opprette eiendommen. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Eiendom opprettet",
      description: `${property.name} ble lagt til i din portefølje.`,
    });
    
    return { ...data, type: data.type as PropertyType };
  } catch (error) {
    console.error("Unexpected error creating property:", error);
    return null;
  }
};

/**
 * Update an existing property
 */
export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere eiendommen. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
      return null;
    }
    
    toast({
      title: "Eiendom oppdatert",
      description: "Eiendommen ble oppdatert.",
    });
    
    return { ...data, type: data.type as PropertyType };
  } catch (error) {
    console.error("Unexpected error updating property:", error);
    return null;
  }
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Feil ved sletting",
        description: "Kunne ikke slette eiendommen. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Eiendom slettet",
      description: "Eiendommen ble slettet fra din portefølje.",
    });
    
    return true;
  } catch (error) {
    console.error("Unexpected error deleting property:", error);
    return false;
  }
};

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
    
    toast({
      title: "Eiendom overført",
      description: "Eiendommen ble overført til ny eier.",
    });
    
    return true;
  } catch (error) {
    console.error("Unexpected error transferring property:", error);
    return false;
  }
};

/**
 * Get expenses for a property
 */
export const getPropertyExpenses = async (propertyId: string): Promise<PropertyExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('property_expenses')
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching property expenses:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching property expenses:", error);
    return [];
  }
};

/**
 * Add an expense to a property
 */
export const addPropertyExpense = async (expense: Omit<PropertyExpense, 'id' | 'created_at' | 'updated_at'>): Promise<PropertyExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('property_expenses')
      .insert([expense])
      .select()
      .single();
    
    if (error) {
      console.error("Error adding property expense:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error adding property expense:", error);
    return null;
  }
};

/**
 * Get documents for a property
 */
export const getPropertyDocuments = async (propertyId: string): Promise<PropertyDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching property documents:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching property documents:", error);
    return [];
  }
};

/**
 * Add a document to a property
 */
export const addPropertyDocument = async (document: Omit<PropertyDocument, 'id' | 'created_at' | 'updated_at'>): Promise<PropertyDocument | null> => {
  try {
    const { data, error } = await supabase
      .from('property_documents')
      .insert([document])
      .select()
      .single();
    
    if (error) {
      console.error("Error adding property document:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error adding property document:", error);
    return null;
  }
};
