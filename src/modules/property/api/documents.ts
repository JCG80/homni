
import { supabase } from '@/integrations/supabase/client';
import { PropertyDocument } from '../types/propertyTypes';

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
