
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, FileText, ArrowRight } from 'lucide-react';

const ContentEditorDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="content_editor" title="Content Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Create and edit website content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start">
              <FilePlus className="mr-2 h-4 w-4" /> Create New Article
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Edit Existing Content
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent content edits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Welcome Page</p>
                    <p className="text-sm text-muted-foreground">Last edited: Today</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Services Overview</p>
                    <p className="text-sm text-muted-foreground">Last edited: Yesterday</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button variant="link" className="pl-0">View all content</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleDashboard>
  );
};

export default ContentEditorDashboard;
