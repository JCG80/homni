/**
 * Property Management Hook
 * Handles property data fetching and state management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { Property } from '../types/propertyTypes';
import { 
  getUserProperties, 
  createProperty as createPropertyApi, 
  updateProperty as updatePropertyApi, 
  deleteProperty as deletePropertyApi 
} from '../api/properties';

export interface UsePropertyReturn {
  properties: Property[] | null;
  loading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
  createProperty: (propertyData: Partial<Property>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

export const useProperty = (): UsePropertyReturn => {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProperties = async () => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getUserProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Kunne ikke laste eiendommer');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshProperties = async () => {
    await fetchProperties();
  };

  const createProperty = async (propertyData: Partial<Property>): Promise<Property> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const propertyToCreate = {
        ...propertyData,
        user_id: user.id,
        name: propertyData.name || 'Ny Eiendom',
        type: propertyData.type || 'apartment'
      } as Omit<Property, 'id' | 'created_at' | 'updated_at'>;

      const newProperty = await createPropertyApi(propertyToCreate);
      
      if (!newProperty) {
        throw new Error('Kunne ikke opprette eiendom');
      }

      // Refresh properties to get the latest data
      await fetchProperties();

      return newProperty;
    } catch (err) {
      console.error('Error creating property:', err);
      throw new Error('Kunne ikke opprette eiendom');
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const updatedProperty = await updatePropertyApi(id, updates);
      
      if (!updatedProperty) {
        throw new Error('Kunne ikke oppdatere eiendom');
      }

      // Refresh properties to get the latest data
      await fetchProperties();
    } catch (err) {
      console.error('Error updating property:', err);
      throw new Error('Kunne ikke oppdatere eiendom');
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const success = await deletePropertyApi(id);
      
      if (!success) {
        throw new Error('Kunne ikke slette eiendom');
      }

      // Refresh properties to get the latest data
      await fetchProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
      throw new Error('Kunne ikke slette eiendom');
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  return {
    properties,
    loading,
    error,
    refreshProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };
};