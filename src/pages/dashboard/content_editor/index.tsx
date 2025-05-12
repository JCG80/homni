
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { FileText, Edit, Settings } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

const ContentEditorDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Content Editor Dashboard">
      <DashboardWidget title="Content Management">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Manage Website Content</h3>
              <p className="text-sm text-muted-foreground">Edit pages, articles, and other website content</p>
            </div>
          </div>
          <div className="mt-2">
            <button className="flex items-center text-sm text-primary hover:underline">
              <Edit className="h-4 w-4 mr-1" /> View Content Dashboard
            </button>
          </div>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Publishing Queue">
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          No pending content for review
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Content Settings">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Content Publishing Settings</h3>
            <p className="text-sm text-muted-foreground">Manage workflow and publishing settings</p>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default ContentEditorDashboard;
