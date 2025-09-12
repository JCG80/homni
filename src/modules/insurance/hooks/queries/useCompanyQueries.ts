
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { 
  fetchInsuranceCompanies,
  fetchInsuranceCompanyById,
  fetchInsuranceCompaniesWithTypes,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany 
} from "../../api";
import { InsuranceCompany } from "../../types/insurance-types";
import { logger } from "@/utils/logger";

// Insurance Companies Queries
export const useInsuranceCompanies = () => {
  return useQuery({
    queryKey: ['insuranceCompanies'],
    queryFn: async () => {
      logger.info('Fetching insurance companies', {
        module: 'useCompanyQueries',
        action: 'fetchInsuranceCompanies'
      });
      const data = await fetchInsuranceCompanies();
      logger.info('Fetched insurance companies:', {
        module: 'useCompanyQueries',
        count: data?.length || 0
      });
      return data;
    }
  });
};

export const useInsuranceCompany = (id: string) => {
  return useQuery({
    queryKey: ['insuranceCompany', id],
    queryFn: async () => {
      logger.info(`Fetching insurance company with id: ${id}`, {
        module: 'useCompanyQueries',
        action: 'fetchInsuranceCompanyById',
        companyId: id
      });
      const data = await fetchInsuranceCompanyById(id);
      logger.info('Fetched insurance company:', {
        module: 'useCompanyQueries',
        companyId: id,
        companyName: data?.name
      });
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
