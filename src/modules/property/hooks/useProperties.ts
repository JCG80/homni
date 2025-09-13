import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Property } from '../types/propertyTypes';
import { logger } from '@/utils/logger';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setProperties((data || []) as Property[]);
      } catch (err) {
        logger.error('Failed to fetch user properties', {
          module: 'useProperties',
          userId: user.id
        }, err as Error);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setProperties((data || []) as Property[]);
    } catch (err) {
      logger.error('Failed to refetch user properties', {
        module: 'useProperties',
        userId: user.id
      }, err as Error);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          user_id: user.id
        }])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setProperties(prev => [data as Property, ...prev]);
      return data;
    } catch (err) {
      logger.error('Failed to add property', {
        module: 'useProperties',
        userId: user.id,
        propertyData
      }, err as Error);
      throw err;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setProperties(prev => prev.map(property => 
        property.id === id ? { ...property, ...(data as Property) } : property
      ));
      return data;
    } catch (err) {
      logger.error('Failed to update property', {
        module: 'useProperties',
        userId: user.id,
        propertyId: id,
        updates
      }, err as Error);
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: supabaseError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (supabaseError) {
        throw supabaseError;
      }

      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (err) {
      logger.error('Failed to delete property', {
        module: 'useProperties',
        userId: user.id,
        propertyId: id
      }, err as Error);
      throw err;
    }
  };

  return {
    properties,
    isLoading,
    error,
    refetch,
    addProperty,
    createProperty: addProperty, // Alias for compatibility
    updateProperty,
    deleteProperty
  };
};