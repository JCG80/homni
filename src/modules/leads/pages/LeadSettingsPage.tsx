
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { LeadSettingsForm } from '../components/LeadSettingsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LeadSettingsPage = () => {
  const { isLoading } = useAuth();
  const { loading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Lead innstillinger</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Generelle innstillinger</TabsTrigger>
          <TabsTrigger value="distribution">Distribusjon</TabsTrigger>
          <TabsTrigger value="notifications">Varsler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Generelle innstillinger</h2>
            <LeadSettingsForm />
          </div>
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-6">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Distribusjonsinnstillinger</h2>
            <p className="text-muted-foreground">
              Konfigurer hvordan leads fordeles mellom bedrifter.
            </p>
            {/* Distribution settings would go here */}
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Varslingsinnstillinger</h2>
            <p className="text-muted-foreground">
              Konfigurer varsler for nye leads og endringer i lead-status.
            </p>
            {/* Notification settings would go here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
