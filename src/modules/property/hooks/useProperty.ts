/**
 * Property Management Hook
 * Handles property data fetching and state management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { Property } from '../types/propertyTypes';
import { supabase } from '@/integrations/supabase/client';

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

      // For now, return mock data since we haven't set up the database table yet
      const mockProperties: Property[] = [
        {
          id: 'prop-1',
          user_id: user.id,
          name: 'Min Leilighet',
          type: 'apartment',
          address: 'Storgata 15, Oslo',
          size: 85,
          purchase_date: '2020-06-15',
          current_value: 5200000,
          description: 'Fin leilighet i sentrum med balkong og heis.',
          created_at: '2020-06-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];

      setProperties(mockProperties);
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
      // Mock creation for now
      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        user_id: user.id,
        name: propertyData.name || 'Ny Eiendom',
        type: propertyData.type || 'apartment',
        address: propertyData.address || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...propertyData
      };

      // Add to current properties
      if (properties) {
        setProperties([...properties, newProperty]);
      } else {
        setProperties([newProperty]);
      }

      return newProperty;
    } catch (err) {
      console.error('Error creating property:', err);
      throw new Error('Kunne ikke opprette eiendom');
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      // Mock update for now
      if (properties) {
        const updatedProperties = properties.map(prop =>
          prop.id === id 
            ? { ...prop, ...updates, updated_at: new Date().toISOString() }
            : prop
        );
        setProperties(updatedProperties);
      }
    } catch (err) {
      console.error('Error updating property:', err);
      throw new Error('Kunne ikke oppdatere eiendom');
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      // Mock deletion for now
      if (properties) {
        const filteredProperties = properties.filter(prop => prop.id !== id);
        setProperties(filteredProperties);
      }
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