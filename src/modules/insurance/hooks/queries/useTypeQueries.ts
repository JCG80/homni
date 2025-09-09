
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { 
  fetchInsuranceTypes,
  fetchInsuranceTypeById,
  createInsuranceType,
  updateInsuranceType,
  deleteInsuranceType 
} from "../../api";
import { InsuranceType } from "../../types/insurance-types";

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
