
import { useState } from 'react';
import { ServicePreference } from '../types/services';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { toast } from 'sonner';

export const useServicePreferences = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuth();

  const savePreferences = async (preferences: ServicePreference[]): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('Du må være logget inn for å lagre preferanser');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Saving preferences for user', user.id, preferences);
      
      // Delete existing preferences first to avoid conflicts
      const { error: deleteError } = await supabase
        .from('user_service_preferences')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) {
        console.error('Error deleting existing preferences:', deleteError);
        throw deleteError;
      }
      
      // Insert new preferences
      if (preferences.length > 0) {
        const prefsToInsert = preferences.map(pref => ({
          user_id: user.id,
          service_id: pref.serviceId,
          selected: pref.selected
        }));
        
        const { error: insertError } = await supabase
          .from('user_service_preferences')
          .insert(prefsToInsert);
          
        if (insertError) {
          console.error('Error inserting preferences:', insertError);
          throw insertError;
        }
      }
      
      toast.success('Preferanser lagret!');
      return true;
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err);
      toast.error('Kunne ikke lagre preferanser: ' + (err.message || 'Ukjent feil'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPreferences = async (): Promise<ServicePreference[]> => {
    if (!isAuthenticated || !user) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading preferences for user', user.id);
      
      const { data, error } = await supabase
        .from('user_service_preferences')
        .select('service_id, selected')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error loading preferences:', error);
        throw error;
      }
      
      // Convert from database format to ServicePreference format
      return data.map(item => ({
        serviceId: item.service_id,
        selected: item.selected
      }));
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
