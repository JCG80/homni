
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit, FileText, Newspaper, Info } from 'lucide-react';

import { ContentEditor } from '../components/ContentEditor';
import { loadContent } from '../api/loadContent';

type ContentItem = {
  id: string;
  title: string;
  slug: string;
  type: string;
  published: boolean;
  created_at: string;
};

export const ContentAdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('news');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => loadContent(),
  });

  const filteredContent = contentItems?.filter(
    (item) => item.type === activeTab
  );

  const contentTypes = [
    { id: 'news', label: 'Nyheter', icon: <Newspaper className="h-4 w-4" /> },
    { id: 'info', label: 'Infosider', icon: <Info className="h-4 w-4" /> },
    { id: 'document', label: 'Dokumenter', icon: <FileText className="h-4 w-4" /> },
  ];

  const handleContentSelect = (id: string) => {
    setSelectedContentId(id);
  };

  const handleContentSave = () => {
    setSelectedContentId(null);
    // Refresh data after save if needed
  };

  const handleCreateNew = () => {
    navigate(`/admin/content/new?type=${activeTab}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster innhold...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Innholdsadministrasjon</h1>
        <Button onClick={handleCreateNew}>Opprett nytt innhold</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          {contentTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="flex items-center">
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {contentTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{type.label}</h2>
            
            {filteredContent?.length === 0 ? (
              <p>Ingen {type.label.toLowerCase()} funnet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContent?.map((item: ContentItem) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(item.created_at).toLocaleDateString('nb-NO')}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.published ? 'Publisert' : 'Utkast'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContentSelect(item.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Rediger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {selectedContentId && (
        <div className="mt-8">
          <Separator className="my-4" />
          <h2 className="text-xl font-semibold mb-4">Rediger innhold</h2>
          <ContentEditor contentId={selectedContentId} onSave={handleContentSave} />
        </div>
      )}
    </div>
  );
};
