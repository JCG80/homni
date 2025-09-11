
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyType, PropertyStatus } from '../types/propertyTypes';
import { showSuccessToast, handlePropertyApiError } from './base';

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
      return [];
    }
    
    // Ensure we're returning properly typed data
    return data?.map(item => ({
      ...item,
      type: item.type as PropertyType,
      status: item.status as PropertyStatus
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
    
    return data ? { 
      ...data, 
      type: data.type as PropertyType,
      status: data.status as PropertyStatus 
    } : null;
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
      handlePropertyApiError(error, "opprette eiendom");
      return null;
    }
    
    showSuccessToast(
      "Eiendom opprettet",
      `${property.name} ble lagt til i din portefølje.`
    );
    
    return { 
      ...data, 
      type: data.type as PropertyType,
      status: data.status as PropertyStatus 
    };
  } catch (error) {
    handlePropertyApiError(error, "opprette eiendom");
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
      handlePropertyApiError(error, "oppdatere eiendom");
      return null;
    }
    
    showSuccessToast(
      "Eiendom oppdatert",
      "Eiendommen ble oppdatert."
    );
    
    return { 
      ...data, 
      type: data.type as PropertyType,
      status: data.status as PropertyStatus 
    };
  } catch (error) {
    handlePropertyApiError(error, "oppdatere eiendom");
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
      handlePropertyApiError(error, "slette eiendom");
      return false;
    }
    
    showSuccessToast(
      "Eiendom slettet",
      "Eiendommen ble slettet fra din portefølje."
    );
    
    return true;
  } catch (error) {
    handlePropertyApiError(error, "slette eiendom");
    return false;
  }
};
