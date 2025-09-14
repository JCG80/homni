
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

/**
 * Helper to unset any existing default filters
 */
export async function unsetExistingDefaults(): Promise<void> {
  const { error } = await supabase
    .from('user_lead_filters')
    .update({ is_default: false })
    .eq('is_default', true);
    
  if (error) {
    console.error('Error unsetting existing default filters:', error);
    throw error;
  }
}

/**
 * Handles common API errors with consistent error logging and toast notifications
 */
export function handleApiError(context: string, error: any): never {
  console.error(`Error in ${context}:`, error);
  
  toast({
    title: `Error in ${context}`,
    description: error?.message || 'An unexpected error occurred',
    variant: 'destructive',
  });
  
  throw error;
}
