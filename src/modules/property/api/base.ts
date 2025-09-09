
import { toast } from "@/components/ui/use-toast";
import { ApiError } from '@/utils/apiHelpers';

/**
 * Common toast notification for API success
 */
export const showSuccessToast = (title: string, description: string) => {
  toast({
    title,
    description,
  });
};

/**
 * Common toast notification for API errors
 */
export const showErrorToast = (title: string, description: string) => {
  toast({
    title: title || "Feil",
    description: description || "Kunne ikke utføre operasjonen. Vennligst prøv igjen senere.",
    variant: "destructive"
  });
};

/**
 * Common error handler for property API operations
 */
export const handlePropertyApiError = (error: any, operation: string): void => {
  console.error(`Error ${operation}:`, error);
  showErrorToast(
    "Feil ved operasjon",
    `Kunne ikke ${operation}. Vennligst prøv igjen senere.`
  );
};
