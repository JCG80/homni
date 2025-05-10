
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Content } from '../types/content-types';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface ContentCardProps {
  content: Content;
  onDelete?: (id: string) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onDelete }) => {
  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Artikkel';
      case 'news': return 'Nyhet';
      case 'guide': return 'Guide';
      default: return type;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'dd. MMMM yyyy HH:mm', { locale: nb });
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge variant={content.published ? 'default' : 'outline'}>
              {content.published ? 'Publisert' : 'Kladd'}
            </Badge>
            <Badge variant="secondary" className="ml-2">
              {getContentTypeLabel(content.type)}
            </Badge>
          </div>
        </div>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>
          <span className="block">
            Opprettet: {formatDate(content.created_at)}
          </span>
          {content.published_at && (
            <span className="block">
              Publisert: {formatDate(content.published_at)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {truncateText(content.body, 150)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline">
          <Link to={`/admin/content/edit/${content.id}`}>Rediger</Link>
        </Button>
        {onDelete && (
          <Button variant="destructive" onClick={() => onDelete(content.id)}>
            Slett
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
