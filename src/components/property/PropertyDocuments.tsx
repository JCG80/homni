import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Trash2, Plus } from 'lucide-react';
import { AddDocumentDialog } from './AddDocumentDialog';

interface PropertyDocument {
  id: string;
  name: string;
  document_type: string;
  file_path?: string;
  created_at: string;
}

interface PropertyDocumentsProps {
  propertyId: string;
}

export const PropertyDocuments = ({ propertyId }: PropertyDocumentsProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['property-documents', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_documents')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyDocument[];
    },
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="animate-pulse p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dokumenter</h3>
          <p className="text-sm text-muted-foreground">
            Last opp og administrer eiendomsdokumenter
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til dokument
        </Button>
      </div>

      {!documents?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">Ingen dokumenter</h4>
            <p className="text-muted-foreground text-center mb-4">
              Last opp dine første eiendomsdokumenter for å komme i gang.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Last opp dokument
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {document.document_type}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(document.created_at).toLocaleDateString('nb-NO')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {document.file_path && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddDocumentDialog
        propertyId={propertyId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};