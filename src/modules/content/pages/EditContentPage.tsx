
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentEditor } from '../components/ContentEditor';
import { useContent } from '../hooks/useContent';
import { ContentFormValues } from '../types/content-types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const EditContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { useContentById, useCreateContent, useUpdateContent } = useContent();
  const { data: existingContent, isLoading: isLoadingContent } = useContentById(isEditing ? id : undefined);
  
  const { mutate: createContent, isPending: isCreating } = useCreateContent();
  const { mutate: updateContent, isPending: isUpdating } = useUpdateContent();
  
  const isLoading = isLoadingContent || isCreating || isUpdating;

  const handleSubmit = (data: ContentFormValues) => {
    if (isEditing && id) {
      updateContent(
        { id, data },
        {
          onSuccess: () => {
            toast({
              title: 'Innhold oppdatert',
              description: 'Innholdet ble oppdatert.',
            });
            navigate('/admin/content');
          },
          onError: (error) => {
            toast({
              title: 'Feil',
              description: 'Kunne ikke oppdatere innholdet.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createContent(
        data,
        {
          onSuccess: () => {
            toast({
              title: 'Innhold opprettet',
              description: 'Nytt innhold ble opprettet.',
            });
            navigate('/admin/content');
          },
          onError: (error) => {
            toast({
              title: 'Feil',
              description: 'Kunne ikke opprette innholdet.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Rediger innhold' : 'Opprett nytt innhold'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/admin/content')}>
          Tilbake til oversikt
        </Button>
      </div>

      {isLoadingContent && isEditing ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-lg shadow">
          <ContentEditor
            initialValues={existingContent || undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
