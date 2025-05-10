
import {
  // Company queries
  useInsuranceCompanies,
  useInsuranceCompany,
  useInsuranceCompaniesWithTypes,
  useCreateInsuranceCompany,
  useUpdateInsuranceCompany,
  useDeleteInsuranceCompany,
  
  // Type queries
  useInsuranceTypes,
  useInsuranceType,
  useCreateInsuranceType,
  useUpdateInsuranceType,
  useDeleteInsuranceType,
  
  // Company Type queries
  useAssociateCompanyWithType,
  useRemoveCompanyTypeAssociation,
  useCompanyTypes,
  
  // Review queries
  useCompanyReviews,
  useCreateCompanyReview,
  useUpdateCompanyReview,
  useDeleteCompanyReview
} from './queries';

// Export individual hooks for direct imports
export {
  useInsuranceCompanies,
  useInsuranceCompany,
  useInsuranceCompaniesWithTypes,
  useCreateInsuranceCompany,
  useUpdateInsuranceCompany,
  useDeleteInsuranceCompany,
  useInsuranceTypes,
  useInsuranceType,
  useCreateInsuranceType,
  useUpdateInsuranceType,
  useDeleteInsuranceType,
  useAssociateCompanyWithType,
  useRemoveCompanyTypeAssociation,
  useCompanyTypes,
  useCompanyReviews,
  useCreateCompanyReview,
  useUpdateCompanyReview,
  useDeleteCompanyReview
};

// Export all hooks as a single object for backward compatibility
export const useInsuranceQueries = {
  useInsuranceCompanies,
  useInsuranceCompany,
  useInsuranceCompaniesWithTypes,
  useCreateInsuranceCompany,
  useUpdateInsuranceCompany,
  useDeleteInsuranceCompany,
  useInsuranceTypes,
  useInsuranceType,
  useCreateInsuranceType,
  useUpdateInsuranceType,
  useDeleteInsuranceType,
  useAssociateCompanyWithType,
  useRemoveCompanyTypeAssociation,
  useCompanyTypes,
  useCompanyReviews,
  useCreateCompanyReview,
  useUpdateCompanyReview,
  useDeleteCompanyReview
};
