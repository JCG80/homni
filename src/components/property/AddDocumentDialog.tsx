import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { toast } from 'sonner';

interface AddDocumentDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DocumentForm {
  name: string;
  document_type: string;
}

const documentTypes = [
  'Skjøte',
  'Kjøpekontrakt', 
  'Takst',
  'Forsikring',
  'Tegninger',
  'Garantier',
  'Vedlikeholdslogger',
  'Fakturaer',
  'Annet'
];

export const AddDocumentDialog = ({ propertyId, open, onOpenChange }: AddDocumentDialogProps) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<DocumentForm>({
    name: '',
    document_type: ''
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (documentData: DocumentForm & { file?: File }) => {
      if (documentData.file) {
        // Use enhanced service for file upload
        return await enhancedPropertyDocumentService.uploadDocument(
          propertyId,
          documentData.file,
          {
            name: documentData.name,
            category_id: documentData.document_type
          }
        );
      } else {
        // Fallback for metadata-only documents
        const { data, error } = await supabase
          .from('property_documents')
          .insert({
            property_id: propertyId,
            name: documentData.name,
            document_type: documentData.document_type
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-documents', propertyId] });
      toast.success('Dokument lagt til');
      setForm({ name: '', document_type: '' });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Kunne ikke legge til dokument');
      console.error('Error adding document:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.document_type) {
      addDocumentMutation.mutate(form);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Legg til dokument</DialogTitle>
          <DialogDescription>
            Registrer et nytt dokument for denne eiendommen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dokumentnavn *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="F.eks. Kjøpekontrakt 2023"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Dokumenttype *</Label>
            <Select
              value={form.document_type}
              onValueChange={(value) => setForm({ ...form, document_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg dokumenttype" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={addDocumentMutation.isPending}>
              {addDocumentMutation.isPending ? 'Legger til...' : 'Legg til'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};