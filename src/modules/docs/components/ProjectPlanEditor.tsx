
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownViewer } from './MarkdownViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectPlanEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const ProjectPlanEditor: React.FC<ProjectPlanEditorProps> = ({ 
  initialContent, 
  onSave, 
  onCancel 
}) => {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<string>('edit');
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rediger prosjektplan</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Rediger</TabsTrigger>
            <TabsTrigger value="preview">Forhåndsvisning</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea 
              className="min-h-[500px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="border rounded-md p-4 min-h-[500px] overflow-y-auto">
              <MarkdownViewer content={content} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Avbryt</Button>
        <Button onClick={() => onSave(content)}>Lagre</Button>
      </CardFooter>
    </Card>
  );
};
