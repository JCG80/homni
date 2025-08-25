
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { getUserProperties } from '../api';
import { Property } from '../types/propertyTypes';
import { PropertyList } from '../components/PropertyList';
import { AddPropertyForm } from '../components/AddPropertyForm';

export const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const userProperties = await getUserProperties();
      setProperties(userProperties);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);
  
  const handlePropertyAdded = (property: Property) => {
    setProperties((prev) => [property, ...prev]);
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mine eiendommer</h1>
          <p className="text-muted-foreground mt-1">
            Administrer dine eiendommer og se detaljert informasjon
          </p>
        </div>
        <AddPropertyForm onSuccess={handlePropertyAdded} />
      </div>
      
      <PropertyList properties={properties} isLoading={isLoading} />
    </div>
  );
};
