
import { supabase } from "@/integrations/supabase/client";
import { 
  InsuranceCompany, 
  InsuranceType, 
  CompanyInsuranceType, 
  CompanyReview,
  InsuranceCompanyWithTypes 
} from "../types/insurance-types";
import { toast } from "@/hooks/use-toast";

// Insurance Companies API
export const fetchInsuranceCompanies = async (): Promise<InsuranceCompany[]> => {
  const { data, error } = await supabase
    .from('insurance_companies')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const fetchInsuranceCompanyById = async (id: string): Promise<InsuranceCompany | null> => {
  const { data, error } = await supabase
    .from('insurance_companies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchInsuranceCompaniesWithTypes = async (): Promise<InsuranceCompanyWithTypes[]> => {
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
};

export const createInsuranceCompany = async (company: Omit<InsuranceCompany, 'id' | 'created_at' | 'updated_at'>): Promise<InsuranceCompany> => {
  const { data, error } = await supabase
    .from('insurance_companies')
    .insert([company])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInsuranceCompany = async (id: string, updates: Partial<InsuranceCompany>): Promise<InsuranceCompany> => {
  const { data, error } = await supabase
    .from('insurance_companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteInsuranceCompany = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('insurance_companies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Insurance Types API
export const fetchInsuranceTypes = async (): Promise<InsuranceType[]> => {
  const { data, error } = await supabase
    .from('insurance_types')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const fetchInsuranceTypeById = async (id: string): Promise<InsuranceType | null> => {
  const { data, error } = await supabase
    .from('insurance_types')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createInsuranceType = async (type: Omit<InsuranceType, 'id' | 'created_at' | 'updated_at'>): Promise<InsuranceType> => {
  const { data, error } = await supabase
    .from('insurance_types')
    .insert([type])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInsuranceType = async (id: string, updates: Partial<InsuranceType>): Promise<InsuranceType> => {
  const { data, error } = await supabase
    .from('insurance_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteInsuranceType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('insurance_types')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Company Insurance Types API
export const associateCompanyWithType = async (companyId: string, typeId: string): Promise<void> => {
  const { error } = await supabase
    .from('company_insurance_types')
    .insert([{ company_id: companyId, type_id: typeId }]);
  
  if (error) throw error;
};

export const removeCompanyTypeAssociation = async (companyId: string, typeId: string): Promise<void> => {
  const { error } = await supabase
    .from('company_insurance_types')
    .delete()
    .eq('company_id', companyId)
    .eq('type_id', typeId);
  
  if (error) throw error;
};

export const fetchCompanyTypes = async (companyId: string): Promise<InsuranceType[]> => {
  const { data, error } = await supabase
    .from('company_insurance_types')
    .select(`
      insurance_types(*)
    `)
    .eq('company_id', companyId);
  
  if (error) throw error;
  
  // Extract the insurance types from the nested structure
  return data.map((item: any) => item.insurance_types) || [];
};

// Company Reviews API
export const fetchCompanyReviews = async (companyId: string): Promise<CompanyReview[]> => {
  const { data, error } = await supabase
    .from('company_reviews')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createCompanyReview = async (review: Omit<CompanyReview, 'id' | 'created_at' | 'updated_at'>): Promise<CompanyReview> => {
  const { data, error } = await supabase
    .from('company_reviews')
    .insert([review])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCompanyReview = async (id: string, updates: Partial<CompanyReview>): Promise<CompanyReview> => {
  const { data, error } = await supabase
    .from('company_reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCompanyReview = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('company_reviews')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
