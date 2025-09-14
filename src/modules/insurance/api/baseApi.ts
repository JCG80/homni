
import { ApiError } from "@/utils/apiHelpers";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

// Base error handling function for insurance API operations
export const handleInsuranceApiError = (context: string, error: any): never => {
  logger.error(`Insurance API error (${context}):`, {
    module: 'insuranceApi',
    context
  }, error);
  toast({
    title: "API Error",
    description: `Could not complete operation: ${context}`,
    variant: "destructive",
  });
  throw new ApiError(context, error);
};
