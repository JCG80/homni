
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ContentEditor } from '../components/ContentEditor';
import { loadContent } from '../api/loadContent';
import { saveContent } from '../api/saveContent';
import { ContentFormValues } from '../types/content-types';

export const EditContentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>(id ? 'Rediger innhold' : 'Nytt innhold');
  
  const handleSubmit = async (data: ContentFormValues) => {
    try {
      setIsLoading(true);
      
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptSave = async (): Promise<boolean> => {
        try {
          await saveContent(data);
          toast({
            title: 'Innhold lagret',
            description: 'Innholdet ble lagret.',
          });
          return true;
        } catch (error) {
          console.error('Error saving content:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying save (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            return attemptSave();
          }
          return false;
        }
      };
      
      const success = await attemptSave();
      
      if (success) {
        navigate('/admin/content');
      } else {
        toast({
          title: 'Feil ved lagring',
          description: 'Kunne ikke lagre innholdet. Vennligst prøv igjen senere.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Redigér innhold</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentEditor 
            contentId={id}
            contentType="article"
            onSave={() => navigate('/admin/content')}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
