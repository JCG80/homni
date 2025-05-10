
import { supabase } from '@/integrations/supabase/client';
import { PropertyExpense } from '../types/propertyTypes';

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
