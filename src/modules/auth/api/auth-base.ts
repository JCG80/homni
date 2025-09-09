
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

/**
 * Generic API error handler
 */
export const handleApiError = (error: any, defaultMessage: string = "En feil oppstod"): string => {
  logger.error("API Error", { error, defaultMessage });
  
  // Try to extract a meaningful error message
  let errorMessage = defaultMessage;
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error_description) {
    errorMessage = error.error_description;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  return errorMessage;
};

/**
 * Show a success toast with a default title and description
 */
export const showSuccessToast = (
  title: string = "Suksess", 
  description: string = "Operasjonen var vellykket"
) => {
  toast({
    title,
    description,
  });
};

/**
 * Show an error toast with a default title and description
 */
export const showErrorToast = (
  title: string = "Feil", 
  description: string = "En feil oppstod. Vennligst prøv igjen."
) => {
  toast({
    title,
    description,
    variant: "destructive"
  });
};
