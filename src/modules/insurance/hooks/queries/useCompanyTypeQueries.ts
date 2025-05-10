
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { 
  associateCompanyWithType,
  removeCompanyTypeAssociation,
  fetchCompanyTypes
} from "../../api";

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
