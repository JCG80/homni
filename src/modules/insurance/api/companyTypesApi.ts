
import { supabase } from "@/integrations/supabase/client";
import { InsuranceType } from "../types/insurance-types";
import { handleInsuranceApiError } from "./baseApi";

// Company Insurance Types API
export const associateCompanyWithType = async (companyId: string, typeId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_insurance_types')
      .insert([{ company_id: companyId, type_id: typeId }]);
    
    if (error) throw error;
  } catch (error) {
    handleInsuranceApiError('associateCompanyWithType', error);
  }
};

export const removeCompanyTypeAssociation = async (companyId: string, typeId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_insurance_types')
      .delete()
      .eq('company_id', companyId)
      .eq('type_id', typeId);
    
    if (error) throw error;
  } catch (error) {
    handleInsuranceApiError('removeCompanyTypeAssociation', error);
  }
};

export const fetchCompanyTypes = async (companyId: string): Promise<InsuranceType[]> => {
  try {
    const { data, error } = await supabase
      .from('company_insurance_types')
      .select(`
        insurance_types(*)
      `)
      .eq('company_id', companyId);
    
    if (error) throw error;
    
    // Extract the insurance types from the nested structure
    return data.map((item: any) => item.insurance_types) || [];
  } catch (error) {
    return handleInsuranceApiError('fetchCompanyTypes', error);
  }
};
