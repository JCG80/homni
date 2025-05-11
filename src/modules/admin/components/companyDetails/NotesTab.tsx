
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader, FileText } from 'lucide-react';
import { CompanyProfile } from '../../types/types';
import { Json } from '@/integrations/supabase/types';

interface NotesTabProps {
  company: CompanyProfile;
  notes: string;
  setNotes: (notes: string) => void;
  isLoading: boolean;
  onUpdate: () => void;
}

export function NotesTab({ company, notes, setNotes, isLoading, onUpdate }: NotesTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const saveNotes = async () => {
    setIsSaving(true);
    try {
      // Get the current metadata or initialize as empty object
      const currentMetadata = (company.metadata as Record<string, any>) || {};
      
      // Update the company record with the new metadata
      const { error } = await supabase
        .from('company_profiles')
        .update({
          metadata: {
            ...currentMetadata,
            admin_notes: notes
          } as Json
        })
        .eq('id', company.id);
      
      if (error) throw error;
      
      toast({
        title: 'Notater lagret',
        description: 'Dine notater ble lagret.',
      });
      
      onUpdate();
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke lagre notater.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Laster notater...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-medium">Interne notater</h3>
      </div>
      <Textarea 
        placeholder="Skriv interne notater om denne bedriften her..."
        className="min-h-[200px]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex justify-end">
        <Button 
          onClick={saveNotes} 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Lagrer...
            </>
          ) : 'Lagre notater'}
        </Button>
      </div>
    </div>
  );
}
