import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Zap, Database, Shield, Users } from 'lucide-react';
import { FeatureFlagsAdminPage } from '@/modules/feature_flags/pages/FeatureFlagsAdminPage';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

export const AdminSettingsPage: React.FC = () => {
  return (
    <RoleDashboard
      title="Admin Settings"
      description="Configure system settings and feature flags"
      requiredRole={['admin', 'master_admin']}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>

        <Tabs defaultValue="feature-flags" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feature-flags" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="system-modules" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              System Modules
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles & Access
            </TabsTrigger>
            <TabsTrigger value="internal-access" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Internal Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feature-flags" className="space-y-4">
            <div className="bg-card rounded-lg">
              <FeatureFlagsAdminPage />
            </div>
          </TabsContent>

          <TabsContent value="system-modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Modules</CardTitle>
                <CardDescription>
                  Manage system modules and their configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  System modules management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Access Control</CardTitle>
                <CardDescription>
                  Configure user roles and access permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  Role management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internal-access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Internal Access Management</CardTitle>
                <CardDescription>
                  Configure internal module access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  Internal access management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleDashboard>
  );
};