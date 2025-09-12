import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Image, FileIcon, CheckCircle2 } from 'lucide-react';
import { enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface DocumentUploadDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export const DocumentUploadDialog = ({ 
  propertyId, 
  open, 
  onOpenChange, 
  onUploadComplete 
}: DocumentUploadDialogProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [documentData, setDocumentData] = useState({
    name: '',
    description: '',
    category_id: '',
    tags: [] as string[],
    is_public: false
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => enhancedPropertyDocumentService.getDocumentCategories(),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);

    // Auto-fill name from first file if empty
    if (!documentData.name && newFiles.length > 0) {
      setDocumentData(prev => ({
        ...prev,
        name: newFiles[0].file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  }, [documentData.name]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const addTag = () => {
    if (tagInput.trim() && !documentData.tags.includes(tagInput.trim())) {
      setDocumentData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setDocumentData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Vennligst velg minst én fil');
      return;
    }

    if (!documentData.name.trim()) {
      toast.error('Vennligst oppgi et navn for dokumentet');
      return;
    }

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      const uploadPromises = files.map(async (fileItem) => {
        try {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: 20 } : f
          ));

          const result = await enhancedPropertyDocumentService.uploadDocument(
            propertyId,
            fileItem.file,
            {
              name: files.length === 1 ? documentData.name : `${documentData.name} - ${fileItem.file.name}`,
              description: documentData.description,
              category_id: documentData.category_id || undefined,
              tags: documentData.tags,
              is_public: documentData.is_public
            }
          );

          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, progress: 100, status: 'completed' as const }
              : f
          ));

          return result;
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error' as const }
              : f
          ));
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      
      // Reset form
      setFiles([]);
      setDocumentData({
        name: '',
        description: '',
        category_id: '',
        tags: [],
        is_public: false
      });

      onUploadComplete();
    } catch (error) {
      logger.error('Upload error:', {}, error);
      toast.error('Noen filer kunne ikke lastes opp');
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Last opp dokumenter</DialogTitle>
          <DialogDescription>
            Last opp dokumenter til din eiendom. Støttede formater: PDF, bilder, Word-dokumenter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            {isDragActive ? (
              <p>Slipp filene her...</p>
            ) : (
              <div>
                <p className="text-sm font-medium">Dra og slipp filer her, eller klikk for å velge</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maksimal filstørrelse: 50MB
                </p>
              </div>
            )}
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Valgte filer ({files.length})</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getFileIcon(fileItem.file)}
                      <span className="text-sm truncate">{fileItem.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(fileItem.file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {fileItem.status === 'uploading' && (
                        <Progress value={fileItem.progress} className="w-16 h-2" />
                      )}
                      {fileItem.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {fileItem.status === 'error' && (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      {fileItem.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Info */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Dokumentnavn *</Label>
              <Input
                id="name"
                value={documentData.name}
                onChange={(e) => setDocumentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="F.eks. Kjøpekontrakt 2024"
              />
            </div>

            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={documentData.description}
                onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kort beskrivelse av dokumentet..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select 
                value={documentData.category_id} 
                onValueChange={(value) => setDocumentData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                        {category.is_required && (
                          <Badge variant="secondary" className="text-xs">Påkrevd</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Stikkord</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Legg til stikkord"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Legg til
                  </Button>
                </div>
                {documentData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {documentData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-auto p-0"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button 
            onClick={uploadFiles} 
            disabled={files.length === 0 || !documentData.name.trim() || files.some(f => f.status === 'uploading')}
          >
            {files.some(f => f.status === 'uploading') ? 'Laster opp...' : 'Last opp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};