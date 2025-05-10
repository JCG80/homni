
import { useState, useEffect } from 'react';
import { Property, PropertyExpense, PropertyDocument } from '../types/propertyTypes';
import { getPropertyById, getPropertyExpenses, getPropertyDocuments } from '../api';

export const usePropertyDetails = (propertyId: string | undefined) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [expenses, setExpenses] = useState<PropertyExpense[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const propertyData = await getPropertyById(propertyId);
        if (propertyData) {
          setProperty(propertyData);
          
          // Load related data
          const [expensesData, documentsData] = await Promise.all([
            getPropertyExpenses(propertyId),
            getPropertyDocuments(propertyId)
          ]);
          
          setExpenses(expensesData);
          setDocuments(documentsData);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPropertyData();
  }, [propertyId]);

  return {
    property,
    expenses,
    documents,
    isLoading
  };
};
