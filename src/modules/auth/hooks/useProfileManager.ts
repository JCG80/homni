
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types/types';
import { useAuth } from './useAuth';
import { useAuthRetry } from './useAuthRetry';
import { toast } from '@/hooks/use-toast';

interface ProfileUpdateOptions {
  showToasts?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useProfileManager = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { executeWithRetry } = useAuthRetry({
    maxRetries: 3,
    showToasts: false
  });

  const updateProfile = useCallback(
    async (profileData: Partial<Profile>, options: ProfileUpdateOptions = {}) => {
      const { showToasts = true, onSuccess, onError } = options;
      
      if (!user) {
        const error = new Error('Ingen bruker er innlogget');
        if (onError) onError(error);
        return null;
      }
      
      setIsLoading(true);
      
      try {
        // Ensure we have the ID field
        const dataWithId = {
          ...profileData,
          id: user.id
        };
        
        const result = await executeWithRetry(async () => {
          const { data, error } = await supabase
            .from('user_profiles')
            .update(dataWithId)
            .eq('id', user.id)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        });
        
        if (result) {
          // Make sure our context is updated with the latest profile data
          await refreshProfile();
          
          if (showToasts) {
            toast({
              title: 'Profil oppdatert',
              description: 'Din profil ble oppdatert',
              variant: 'default',
            });
          }
          
          if (onSuccess) onSuccess();
          return result;
        }
        
        return null;
      } catch (error) {
        console.error('Error updating profile:', error);
        
        const errorObj = error instanceof Error ? error : new Error('Ukjent feil ved oppdatering av profil');
        
        if (showToasts) {
          toast({
            title: 'Feil ved oppdatering',
            description: errorObj.message,
            variant: 'destructive',
          });
        }
        
        if (onError) onError(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [executeWithRetry, refreshProfile, user]
  );

  const fetchProfileById = useCallback(
    async (userId: string) => {
      return executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      });
    },
    [executeWithRetry]
  );

  return {
    updateProfile,
    fetchProfileById,
    isLoading,
    currentProfile: profile
  };
};
