import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  MoreVertical, 
  Eye, 
  Share2,
  Tag,
  Calendar,
  FileIcon
} from 'lucide-react';
import { PropertyDocument, enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface DocumentGridProps {
  documents: PropertyDocument[];
  isLoading: boolean;
  onRefetch: () => void;
}

export const DocumentGrid = ({ documents, isLoading, onRefetch }: DocumentGridProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mt-1"></div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold mb-2">Ingen dokumenter funnet</h4>
          <p className="text-muted-foreground text-center">
            Last opp dine første eiendomsdokumenter for å komme i gang.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (mimeType?: string, size = 'h-10 w-10') => {
    if (!mimeType) return <FileIcon className={size} />;
    
    if (mimeType.startsWith('image/')) return <Image className={size} />;
    if (mimeType === 'application/pdf') return <FileText className={size} />;
    return <FileIcon className={size} />;
  };

  const getFileTypeColor = (mimeType?: string) => {
    if (!mimeType) return 'text-gray-600';
    if (mimeType.startsWith('image/')) return 'text-blue-600';
    if (mimeType === 'application/pdf') return 'text-red-600';
    return 'text-gray-600';
  };

  const handleDownload = async (document: PropertyDocument) => {
    if (!document.file_path) return;
    
    try {
      const url = await enhancedPropertyDocumentService.getDocumentUrl(document.file_path);
      if (url) {
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.name;
        link.click();
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Er du sikker på at du vil slette dette dokumentet?')) {
      setDeletingId(documentId);
      try {
        await enhancedPropertyDocumentService.deleteDocument(documentId);
        onRefetch();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header with Icon and Actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={getFileTypeColor(document.mime_type)}>
                    {getFileIcon(document.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight truncate">{document.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {document.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      {document.file_size && ` • ${formatFileSize(document.file_size)}`}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(document)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Vis
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(document)}>
                      <Download className="mr-2 h-4 w-4" />
                      Last ned
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Del
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(document.id)}
                      disabled={deletingId === document.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingId === document.id ? 'Sletter...' : 'Slett'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              {document.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {document.description}
                </p>
              )}

              {/* Category Badge */}
              {document.category && (
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${document.category.color}20`,
                      color: document.category.color,
                      borderColor: `${document.category.color}40`
                    }}
                  >
                    {document.category.name}
                  </Badge>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {document.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground bg-muted px-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {document.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{document.tags.length - 2} flere
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer with Date */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(document.created_at), { 
                      addSuffix: true, 
                      locale: nb 
                    })}
                  </span>
                </div>
                {document.current_version > 1 && (
                  <span className="text-xs bg-muted px-1 rounded">
                    v{document.current_version}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};