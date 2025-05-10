
// ⚡️ FIX: Updated ContentEditor to properly type contentType
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { loadContent } from '../api/loadContent';
import { saveContent } from '../api/saveContent';
import { ContentFormValues, ContentType } from '../types/content-types';

export interface ContentEditorProps {
  contentId?: string;
  contentType?: ContentType;
  onSave?: () => void;
  isLoading?: boolean;
}

export const ContentEditor = ({ contentId, contentType = 'article', onSave, isLoading: externalLoading }: ContentEditorProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const actualId = contentId || id;
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(actualId ? true : false);
  
  // Load existing content if we have an ID
  useEffect(() => {
    if (actualId) {
      let retryCount = 0;
      const maxRetries = 3;
      
      const fetchContent = async () => {
        try {
          setInitialLoading(true);
          const content = await loadContent(actualId);
          if (content) {
            setTitle(content.title || '');
            setBody(content.body || '');
            setSlug(content.slug || '');
            setPublished(content.published || false);
          }
        } catch (error) {
          console.error('Failed to load content:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying content load (${retryCount}/${maxRetries})...`);
            setTimeout(fetchContent, 1000 * retryCount);
          } else {
            toast({
              title: 'Feil ved lasting',
              description: 'Kunne ikke laste innholdet. Vennligst prøv igjen senere.',
              variant: 'destructive',
            });
          }
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchContent();
    }
  }, [actualId]);

  const handleSave = async () => {
    if (!title || !body || !slug) {
      toast({
        title: 'Manglende informasjon',
        description: 'Vennligst fyll ut tittel, innhold og slug.',
        variant: 'destructive',
      });
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;
    const attemptSave = async () => {
      try {
        setLoading(true);
        
        const contentData: ContentFormValues = {
          id: actualId,
          title,
          body,
          slug,
          type: contentType,
          published,
        };
        
        await saveContent(contentData);

        toast({
          title: 'Innhold lagret',
          description: 'Innholdet ble lagret.',
        });

        if (onSave) {
          onSave();
        } else {
          navigate('/admin/content');
        }
      } catch (error) {
        console.error('Error saving content:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying save (${retryCount}/${maxRetries})...`);
          setTimeout(attemptSave, 1000 * retryCount);
        } else {
          toast({
            title: 'Feil ved lagring',
            description: 'Kunne ikke lagre innholdet. Vennligst prøv igjen senere.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    await attemptSave();
  };

  if (initialLoading || externalLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Laster innhold...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Tittel</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Skriv tittel her"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug-for-url"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Innhold</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[200px]"
          placeholder="Skriv innholdet her..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={setPublished}
        />
        <Label htmlFor="published">Publisert</Label>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            if (onSave) {
              onSave();
            } else {
              navigate('/admin/content');
            }
          }}
        >
          Avbryt
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Lagrer...' : 'Lagre innhold'}
        </Button>
      </div>
    </div>
  );
};
