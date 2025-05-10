
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

export interface ContentEditorProps {
  contentId?: string;
  contentType?: string;
  onSave?: () => void;
}

export const ContentEditor = ({ contentId, contentType = 'article', onSave }: ContentEditorProps) => {
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
      setInitialLoading(true);
      loadContent(actualId)
        .then(content => {
          if (content) {
            setTitle(content.title || '');
            setBody(content.body || '');
            setSlug(content.slug || '');
            setPublished(content.published || false);
          }
        })
        .catch(error => {
          console.error('Failed to load content:', error);
          toast({
            title: 'Feil ved lasting',
            description: 'Kunne ikke laste innholdet. Vennligst prøv igjen senere.',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setInitialLoading(false);
        });
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

    try {
      setLoading(true);
      
      await saveContent({
        id: actualId,
        title,
        body,
        slug,
        type: contentType,
        published,
      });

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
      toast({
        title: 'Feil ved lagring',
        description: 'Kunne ikke lagre innholdet. Vennligst prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
          placeholder="Skriv innholdet her..."
          className="min-h-[200px]"
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
