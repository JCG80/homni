
import { ApiError } from "@/utils/apiHelpers";
import { toast } from "@/components/ui/use-toast";

// Base error handling function for insurance API operations
export const handleInsuranceApiError = (context: string, error: any): never => {
  console.error(`Insurance API error (${context}):`, error);
  toast({
    title: "API Error",
    description: `Could not complete operation: ${context}`,
    variant: "destructive",
  });
  throw new ApiError(context, error);
};
