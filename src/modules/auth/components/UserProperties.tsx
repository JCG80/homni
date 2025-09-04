
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { Property } from '@/modules/property/types/propertyTypes';
import { PropertyList } from '@/modules/property/components/PropertyList';
import { AddPropertyForm } from '@/modules/property/components/AddPropertyForm';
import { getUserProperties } from '@/modules/property/api';

export const UserProperties: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);
  
  const loadProperties = async () => {
    setIsLoadingProperties(true);
    try {
      const userProperties = await getUserProperties();
      setProperties(userProperties);
    } finally {
      setIsLoadingProperties(false);
    }
  };
  
  const handlePropertyAdded = (property: Property) => {
    setProperties((prev) => [property, ...prev]);
  };
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mine eiendommer</h2>
        <AddPropertyForm onSuccess={handlePropertyAdded} />
      </div>
      
      <PropertyList properties={properties} isLoading={isLoadingProperties} error={null} />
      
      {properties.length > 0 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/properties')}
          >
            Se alle eiendommer
          </Button>
        </div>
      )}
    </>
  );
};
