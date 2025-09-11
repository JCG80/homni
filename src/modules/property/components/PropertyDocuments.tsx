import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { DocumentGrid } from '@/components/property/enhanced/DocumentGrid';
import { DocumentUploadDialog } from '@/components/property/enhanced/DocumentUploadDialog';
import { Plus } from 'lucide-react';

interface PropertyDocumentsProps {
  propertyId: string;
}

export const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({ propertyId }) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['property-documents', propertyId],
    queryFn: () => enhancedPropertyDocumentService.getPropertyDocuments(propertyId),
    enabled: !!propertyId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Dokumenter</h2>
          <p className="text-muted-foreground">
            Last opp og organiser alle viktige dokumenter for eiendommen
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Last opp dokument
        </Button>
      </div>

      {/* Documents Grid */}
      <DocumentGrid 
        documents={documents} 
        isLoading={isLoading} 
        onRefetch={refetch}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        propertyId={propertyId}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={() => {
          refetch();
          setUploadDialogOpen(false);
        }}
      />
    </div>
  );
};