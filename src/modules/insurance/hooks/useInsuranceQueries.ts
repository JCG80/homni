
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchInsuranceCompanies,
  fetchInsuranceCompanyById,
  fetchInsuranceCompaniesWithTypes,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany,
  fetchInsuranceTypes,
  fetchInsuranceTypeById,
  createInsuranceType,
  updateInsuranceType,
  deleteInsuranceType,
  associateCompanyWithType,
  removeCompanyTypeAssociation,
  fetchCompanyTypes,
  fetchCompanyReviews,
  createCompanyReview,
  updateCompanyReview,
  deleteCompanyReview
} from "../api";
import { InsuranceCompany, InsuranceType, CompanyReview } from "../types/insurance-types";
import { toast } from "@/hooks/use-toast";

// Insurance Companies Queries
export const useInsuranceCompanies = () => {
  return useQuery({
    queryKey: ['insuranceCompanies'],
    queryFn: fetchInsuranceCompanies
  });
};

export const useInsuranceCompany = (id: string) => {
  return useQuery({
    queryKey: ['insuranceCompany', id],
    queryFn: () => fetchInsuranceCompanyById(id),
    enabled: !!id
  });
};

export const useInsuranceCompaniesWithTypes = () => {
  return useQuery({
    queryKey: ['insuranceCompaniesWithTypes'],
    queryFn: fetchInsuranceCompaniesWithTypes
  });
};

export const useCreateInsuranceCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (company: Omit<InsuranceCompany, 'id' | 'created_at' | 'updated_at'>) => 
      createInsuranceCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceCompanies'] });
      toast({
        title: "Forsikringsselskap opprettet",
        description: "Nytt forsikringsselskap ble lagt til"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved opprettelse",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateInsuranceCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<InsuranceCompany> }) => 
      updateInsuranceCompany(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insuranceCompanies'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceCompany', variables.id] });
      toast({
        title: "Forsikringsselskap oppdatert",
        description: "Endringene ble lagret"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteInsuranceCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteInsuranceCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceCompanies'] });
      toast({
        title: "Forsikringsselskap slettet",
        description: "Forsikringsselskapet ble fjernet"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Insurance Types Queries
export const useInsuranceTypes = () => {
  return useQuery({
    queryKey: ['insuranceTypes'],
    queryFn: fetchInsuranceTypes
  });
};

export const useInsuranceType = (id: string) => {
  return useQuery({
    queryKey: ['insuranceType', id],
    queryFn: () => fetchInsuranceTypeById(id),
    enabled: !!id
  });
};

export const useCreateInsuranceType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (type: Omit<InsuranceType, 'id' | 'created_at' | 'updated_at'>) => 
      createInsuranceType(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceTypes'] });
      toast({
        title: "Forsikringstype opprettet",
        description: "Ny forsikringstype ble lagt til"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved opprettelse",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateInsuranceType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<InsuranceType> }) => 
      updateInsuranceType(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insuranceTypes'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceType', variables.id] });
      toast({
        title: "Forsikringstype oppdatert",
        description: "Endringene ble lagret"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteInsuranceType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteInsuranceType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insuranceTypes'] });
      toast({
        title: "Forsikringstype slettet",
        description: "Forsikringstypen ble fjernet"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Company Insurance Types Queries
export const useAssociateCompanyWithType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ companyId, typeId }: { companyId: string, typeId: string }) => 
      associateCompanyWithType(companyId, typeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyTypes', variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ['insuranceCompaniesWithTypes'] });
      toast({
        title: "Forsikringstype lagt til",
        description: "Forsikringstypen ble lagt til selskapet"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved tilknytning",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useRemoveCompanyTypeAssociation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ companyId, typeId }: { companyId: string, typeId: string }) => 
      removeCompanyTypeAssociation(companyId, typeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyTypes', variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ['insuranceCompaniesWithTypes'] });
      toast({
        title: "Forsikringstype fjernet",
        description: "Forsikringstypen ble fjernet fra selskapet"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved fjerning",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useCompanyTypes = (companyId: string) => {
  return useQuery({
    queryKey: ['companyTypes', companyId],
    queryFn: () => fetchCompanyTypes(companyId),
    enabled: !!companyId
  });
};

// Company Reviews Queries
export const useCompanyReviews = (companyId: string) => {
  return useQuery({
    queryKey: ['companyReviews', companyId],
    queryFn: () => fetchCompanyReviews(companyId),
    enabled: !!companyId
  });
};

export const useCreateCompanyReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (review: Omit<CompanyReview, 'id' | 'created_at' | 'updated_at'>) => 
      createCompanyReview(review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyReviews', variables.company_id] });
      toast({
        title: "Anmeldelse opprettet",
        description: "Din anmeldelse ble lagt til"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved opprettelse",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateCompanyReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<CompanyReview> }) => 
      updateCompanyReview(id, updates),
    onSuccess: (_, variables) => {
      // Assume we have the companyId in the updates
      if (variables.updates.company_id) {
        queryClient.invalidateQueries({ queryKey: ['companyReviews', variables.updates.company_id] });
      }
      toast({
        title: "Anmeldelse oppdatert",
        description: "Endringene ble lagret"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteCompanyReview = (companyId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCompanyReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyReviews', companyId] });
      toast({
        title: "Anmeldelse slettet",
        description: "Anmeldelsen ble fjernet"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Export all hooks as a single object for easier import
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
