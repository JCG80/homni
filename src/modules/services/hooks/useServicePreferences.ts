
import { useState } from 'react';
import { ServicePreference } from '../types/services';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useServicePreferences = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const savePreferences = async (preferences: ServicePreference[]): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to save preferences');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would save to the database
      // For now, just simulate the API call with a timeout
      console.log('Saving preferences for user', user.id, preferences);
      
      // This is where you'd make the actual Supabase call
      // Example (uncomment when the table exists):
      /*
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          services: preferences,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return true;
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPreferences = async (): Promise<ServicePreference[]> => {
    if (!user) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would load from the database
      // For now, just return an empty array
      console.log('Loading preferences for user', user.id);
      
      // This is where you'd make the actual Supabase call
      // Example (uncomment when the table exists):
      /*
      const { data, error } = await supabase
        .from('user_preferences')
        .select('services')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data?.services || [];
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return [];
    } catch (err: any) {
      console.error('Error loading preferences:', err);
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    savePreferences,
    loadPreferences,
    isLoading,
    error
  };
};
