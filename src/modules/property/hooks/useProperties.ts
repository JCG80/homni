import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';

interface Property {
  id: string;
  name: string;
  type: string;
  address?: string;
  size?: number;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err as Error);
      toast.error('Feil ved lasting av eiendommer');
    } finally {
      setIsLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: createError } = await supabase
        .from('properties')
        .insert({
          name: propertyData.name,
          type: propertyData.type,
          address: propertyData.address,
          size: propertyData.size,
          purchase_date: propertyData.purchase_date,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      setProperties(prev => [data, ...prev]);
      toast.success('Eiendom opprettet');
      return data;
    } catch (err) {
      console.error('Error creating property:', err);
      toast.error('Feil ved opprettelse av eiendom');
      throw err;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProperties(prev => 
        prev.map(p => p.id === id ? { ...p, ...data } : p)
      );
      toast.success('Eiendom oppdatert');
      return data;
    } catch (err) {
      console.error('Error updating property:', err);
      toast.error('Feil ved oppdatering av eiendom');
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success('Eiendom slettet');
    } catch (err) {
      console.error('Error deleting property:', err);
      toast.error('Feil ved sletting av eiendom');
      throw err;
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}