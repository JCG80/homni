
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { 
  fetchInsuranceCompanies,
  fetchInsuranceCompanyById,
  fetchInsuranceCompaniesWithTypes,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany 
} from "../../api";
import { InsuranceCompany } from "../../types/insurance-types";

// Insurance Companies Queries
export const useInsuranceCompanies = () => {
  return useQuery({
    queryKey: ['insuranceCompanies'],
    queryFn: async () => {
      console.log('Fetching insurance companies');
      const data = await fetchInsuranceCompanies();
      console.log('Fetched insurance companies:', data);
      return data;
    }
  });
};

export const useInsuranceCompany = (id: string) => {
  return useQuery({
    queryKey: ['insuranceCompany', id],
    queryFn: async () => {
      console.log(`Fetching insurance company with id: ${id}`);
      const data = await fetchInsuranceCompanyById(id);
      console.log('Fetched insurance company:', data);
      return data;
    },
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
