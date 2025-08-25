
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, FileText, Clock, Eye, Pencil } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ContentEditorDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="content_editor" title="Content Editor Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Content
            </CardTitle>
            <CardDescription>Recently edited and published content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="grid grid-cols-1 divide-y divide-border rounded-md border overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Home Page Hero</p>
                      <p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service Comparison Page</p>
                      <p className="text-xs text-muted-foreground">Updated yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">FAQ Section</p>
                      <p className="text-xs text-muted-foreground">Updated 3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                View all content
              </Button>
              <Button size="sm">
                <FilePlus className="mr-2 h-4 w-4" />
                Create new content
              </Button>
            </div>
          </CardContent>
        </Card>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Publishing Schedule</span>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="p-3 border rounded-md bg-muted/30">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Seasonal promotion</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Scheduled
                </span>
              </div>
              <p className="text-xs text-muted-foreground">May 21, 2025 - 10:00 AM</p>
            </div>
            
            <div className="p-3 border rounded-md bg-muted/30">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Feature announcement</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Scheduled
                </span>
              </div>
              <p className="text-xs text-muted-foreground">May 24, 2025 - 2:00 PM</p>
            </div>
            
            <div className="p-3 border rounded-md bg-muted/30">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Partner spotlight</span>
                <span className="text-xs bg-muted-foreground/50 px-2 py-0.5 rounded-full">
                  Draft
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Not scheduled</p>
            </div>
            
            <Button variant="outline" className="w-full" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              View calendar
            </Button>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <FilePlus className="h-5 w-5" />
              <span>Quick Create</span>
            </div>
          }
          className="col-span-1"
        >
          <div className="grid grid-cols-1 gap-2">
            <Button className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              New page
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              New blog post
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              New landing page
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              New document
            </Button>
          </div>
        </DashboardWidget>
      </div>
    </RoleDashboard>
  );
};

export default ContentEditorDashboard;
