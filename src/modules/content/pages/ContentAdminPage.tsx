
import { useState } from 'react';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit, News, Info, FileText } from 'lucide-react';

import { ContentEditor } from '../components/ContentEditor';

const CONTENT_TYPES = [
  { id: 'news', name: 'Nyheter', icon: News },
  { id: 'info', name: 'Infosider', icon: Info },
  { id: 'insurance-info', name: 'Forsikring', icon: FileText },
];

export const ContentAdminPage = () => {
  const [selectedType, setSelectedType] = useState('news');
  const { loading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin', 'editor'],
    redirectTo: '/unauthorized'
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-6 w-6" />
            <span>Innholdsadministrasjon</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="w-full grid grid-cols-3">
              {CONTENT_TYPES.map(type => (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {CONTENT_TYPES.map(type => (
              <TabsContent key={type.id} value={type.id}>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {type.name}
                    </h3>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Opprett ny
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <ContentListForType type={type.id} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface ContentListProps {
  type: string;
}

const ContentListForType = ({ type }: ContentListProps) => {
  // This would be replaced with actual content fetching logic
  const mockContents = [
    { id: '1', title: 'Test innhold 1', slug: 'test-1', published: true },
    { id: '2', title: 'Test innhold 2', slug: 'test-2', published: false },
  ];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  if (editingId) {
    return (
      <div>
        <Button variant="outline" onClick={() => setEditingId(null)} className="mb-4">
          Tilbake til liste
        </Button>
        <ContentEditor
          id={editingId}
          onSave={() => setEditingId(null)}
          contentType={type}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {mockContents.map(content => (
        <Card key={content.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{content.title}</h4>
                <p className="text-sm text-muted-foreground">/{content.slug}</p>
                <div className="mt-1">
                  {content.published ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Publisert
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Utkast
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => setEditingId(content.id)}>
                Rediger
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {mockContents.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">Ingen innhold finnes for denne kategorien enda.</p>
          <Button className="mt-4">Opprett nytt innhold</Button>
        </div>
      )}
    </div>
  );
};

export default ContentAdminPage;
