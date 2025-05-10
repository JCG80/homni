
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PropertyDocument } from '../../types/propertyTypes';
import { formatDate } from '../../utils/propertyUtils';

interface PropertyDocumentsTabProps {
  documents: PropertyDocument[];
}

export const PropertyDocumentsTab: React.FC<PropertyDocumentsTabProps> = ({ documents }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dokumenter</CardTitle>
        <CardDescription>
          Viktige dokumenter knyttet til eiendommen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Ingen dokumenter registrert for denne eiendommen.</p>
            <Button className="mt-4">Last opp dokument</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div>Navn</div>
              <div>Type</div>
              <div>Dato</div>
            </div>
            
            {documents.map((doc) => (
              <div key={doc.id} className="grid grid-cols-3 text-sm py-2">
                <div>{doc.name}</div>
                <div>{doc.document_type}</div>
                <div>{formatDate(doc.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
