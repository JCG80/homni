
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePropertyDetails } from '../hooks/usePropertyDetails';
import { PropertyHeader } from '../components/PropertyHeader';
import { PropertyLoadingState } from '../components/PropertyLoadingState';
import { PropertyNotFound } from '../components/PropertyNotFound';
import { PropertyOverviewTab } from '../components/tabs/PropertyOverviewTab';
import { PropertyExpensesTab } from '../components/tabs/PropertyExpensesTab';
import { PropertyDocumentsTab } from '../components/tabs/PropertyDocumentsTab';

export const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const { property, expenses, documents, isLoading } = usePropertyDetails(propertyId);

  if (isLoading) {
    return <PropertyLoadingState />;
  }

  if (!property) {
    return <PropertyNotFound />;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <PropertyHeader property={property} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="expenses">Utgifter</TabsTrigger>
          <TabsTrigger value="documents">Dokumenter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <PropertyOverviewTab 
            property={property} 
            expenses={expenses} 
            documentsCount={documents.length} 
          />
        </TabsContent>
        
        <TabsContent value="expenses">
          <PropertyExpensesTab expenses={expenses} />
        </TabsContent>
        
        <TabsContent value="documents">
          <PropertyDocumentsTab documents={documents} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
