
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadAllContent } from '../api/loadContent';
import { deleteContent } from '../api/deleteContent';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Content } from '../types/content-types';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ContentAdminPage: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptFetch = async (): Promise<Content[]> => {
      try {
        const data = await loadAllContent();
        return data;
      } catch (error) {
        console.error('Error loading content:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying content load (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptFetch();
        }
        throw error;
      }
    };

    try {
      setLoading(true);
      setError(null);
      const contentData = await attemptFetch();
      setContent(contentData);
    } catch (err) {
      console.error('Failed to load content:', err);
      setError('Kunne ikke laste innhold. Vennligst prøv igjen senere.');
      toast({
        title: 'Feil ved lasting',
        description: 'Kunne ikke laste innhold. Vennligst prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette innholdet?')) return;

    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptDelete = async (): Promise<boolean> => {
      try {
        const success = await deleteContent(id);
        return success;
      } catch (error) {
        console.error('Error deleting content:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying delete (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptDelete();
        }
        return false;
      }
    };
    
    try {
      const success = await attemptDelete();
      
      if (success) {
        setContent(content.filter((item) => item.id !== id));
        toast({
          title: 'Innhold slettet',
          description: 'Innholdet ble slettet.',
        });
      } else {
        toast({
          title: 'Feil ved sletting',
          description: 'Kunne ikke slette innholdet. Vennligst prøv igjen senere.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to delete content:', err);
      toast({
        title: 'Feil ved sletting',
        description: 'Kunne ikke slette innholdet. Vennligst prøv igjen senere.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Innholdsadministrasjon</h1>
        <Link to="/admin/content/new">
          <Button>Nytt innhold</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Innholdsoversikt</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tittel</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dato</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Ingen innhold funnet. Opprett nytt innhold for å komme i gang.
                    </TableCell>
                  </TableRow>
                ) : (
                  content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.slug}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Badge variant={item.published ? 'default' : 'outline'}>
                          {item.published ? 'Publisert' : 'Utkast'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Åpne meny</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link to={`/admin/content/edit/${item.id}`}>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Rediger
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Slett
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
