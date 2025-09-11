
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PropertyDocuments } from '@/modules/property/components/PropertyDocuments';

interface PropertyDocumentsTabProps {
  documents: any[];
}

export const PropertyDocumentsTab: React.FC<PropertyDocumentsTabProps> = ({ documents }) => {
  const { propertyId } = useParams<{ propertyId: string }>();
  
  if (!propertyId) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Ingen eiendom valgt.</p>
      </div>
    );
  }

  return <PropertyDocuments propertyId={propertyId} />;
};
