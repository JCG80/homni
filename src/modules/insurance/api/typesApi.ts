
import { supabase } from "@/integrations/supabase/client";
import { InsuranceType } from "../types/insurance-types";
import { handleInsuranceApiError } from "./baseApi";

// Insurance Types API
export const fetchInsuranceTypes = async (): Promise<InsuranceType[]> => {
  try {
    const { data, error } = await supabase
      .from('insurance_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleInsuranceApiError('fetchInsuranceTypes', error);
  }
};

export const fetchInsuranceTypeById = async (id: string): Promise<InsuranceType | null> => {
  try {
    const { data, error } = await supabase
      .from('insurance_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('fetchInsuranceTypeById', error);
  }
};

export const createInsuranceType = async (type: Omit<InsuranceType, 'id' | 'created_at' | 'updated_at'>): Promise<InsuranceType> => {
  try {
    const { data, error } = await supabase
      .from('insurance_types')
      .insert([type])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('createInsuranceType', error);
  }
};

export const updateInsuranceType = async (id: string, updates: Partial<InsuranceType>): Promise<InsuranceType> => {
  try {
    const { data, error } = await supabase
      .from('insurance_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('updateInsuranceType', error);
  }
};

export const deleteInsuranceType = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('insurance_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    handleInsuranceApiError('deleteInsuranceType', error);
  }
};
