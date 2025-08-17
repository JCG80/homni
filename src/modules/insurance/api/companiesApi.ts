
import { supabase } from "@/lib/supabaseClient";
import { InsuranceCompany, InsuranceCompanyWithTypes } from "../types/insurance-types";
import { handleInsuranceApiError } from "./baseApi";

// Insurance Companies API
export const fetchInsuranceCompanies = async (): Promise<InsuranceCompany[]> => {
  try {
    const { data, error } = await supabase
      .from('insurance_companies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleInsuranceApiError('fetchInsuranceCompanies', error);
  }
};

export const fetchInsuranceCompanyById = async (id: string): Promise<InsuranceCompany | null> => {
  try {
    const { data, error } = await supabase
      .from('insurance_companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('fetchInsuranceCompanyById', error);
  }
};

export const fetchInsuranceCompaniesWithTypes = async (): Promise<InsuranceCompanyWithTypes[]> => {
  try {
    const { data, error } = await supabase
      .from('insurance_companies')
      .select(`
        *,
        company_insurance_types!inner(
          insurance_types(*)
        )
      `)
      .order('name');
    
    if (error) throw error;
    
    // Transform data to match our expected types
    const companiesWithTypes = data.map((company) => {
      const typesArray = company.company_insurance_types?.map(
        (item: any) => item.insurance_types
      ) || [];
      
      return {
        ...company,
        insurance_types: typesArray
      };
    });
    
    return companiesWithTypes;
  } catch (error) {
    return handleInsuranceApiError('fetchInsuranceCompaniesWithTypes', error);
  }
};

export const createInsuranceCompany = async (company: Omit<InsuranceCompany, 'id' | 'created_at' | 'updated_at'>): Promise<InsuranceCompany> => {
  try {
    const { data, error } = await supabase
      .from('insurance_companies')
      .insert([company])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('createInsuranceCompany', error);
  }
};

export const updateInsuranceCompany = async (id: string, updates: Partial<InsuranceCompany>): Promise<InsuranceCompany> => {
  try {
    const { data, error } = await supabase
      .from('insurance_companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('updateInsuranceCompany', error);
  }
};

export const deleteInsuranceCompany = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('insurance_companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    handleInsuranceApiError('deleteInsuranceCompany', error);
  }
};
