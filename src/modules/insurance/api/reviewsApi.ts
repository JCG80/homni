
import { supabase } from "@/lib/supabaseClient";
import { CompanyReview } from "../types/insurance-types";
import { handleInsuranceApiError } from "./baseApi";

// Company Reviews API
export const fetchCompanyReviews = async (companyId: string): Promise<CompanyReview[]> => {
  try {
    const { data, error } = await supabase
      .from('company_reviews')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleInsuranceApiError('fetchCompanyReviews', error);
  }
};

export const createCompanyReview = async (review: Omit<CompanyReview, 'id' | 'created_at' | 'updated_at'>): Promise<CompanyReview> => {
  try {
    const { data, error } = await supabase
      .from('company_reviews')
      .insert([review])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('createCompanyReview', error);
  }
};

export const updateCompanyReview = async (id: string, updates: Partial<CompanyReview>): Promise<CompanyReview> => {
  try {
    const { data, error } = await supabase
      .from('company_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleInsuranceApiError('updateCompanyReview', error);
  }
};

export const deleteCompanyReview = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    handleInsuranceApiError('deleteCompanyReview', error);
  }
};
