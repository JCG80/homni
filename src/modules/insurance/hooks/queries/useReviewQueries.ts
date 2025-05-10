
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { 
  fetchCompanyReviews,
  createCompanyReview,
  updateCompanyReview,
  deleteCompanyReview
} from "../../api";
import { CompanyReview } from "../../types/insurance-types";

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
