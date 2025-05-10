
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Common error handling utilities
export const handleApiError = (error: any, defaultMessage: string = "En uventet feil oppstod"): Error => {
  console.error("API Error:", error);
  return error instanceof Error ? error : new Error(defaultMessage);
};

// Common toast notifications
export const showErrorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

export const showSuccessToast = (title: string, description: string) => {
  toast({
    title,
    description,
  });
};
