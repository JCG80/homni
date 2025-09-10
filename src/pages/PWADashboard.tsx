import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Zap, Bell } from 'lucide-react';
import { PWAInstallPrompt, PWAStatus, NotificationManager } from '@/components/pwa/PWAComponents';
import { PerformanceOptimizer } from '@/components/performance/PerformanceOptimizer';

const PWADashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">PWA & Ytelse</h1>
        <p className="text-muted-foreground">
          Administrer Progressive Web App funksjoner og optimaliser ytelse
        </p>
      </div>

      <PWAStatus />
      
      <Tabs defaultValue="pwa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pwa" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            PWA Funksjoner
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Ytelse
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Varsler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pwa" className="space-y-4">
          <PWAInstallPrompt />
          
          <Card>
            <CardHeader>
              <CardTitle>Progressive Web App Status</CardTitle>
              <CardDescription>
                Oversikt over PWA funksjoner og installasjonsstatus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Service Worker</h4>
                  <p className="text-sm text-muted-foreground">
                    Håndterer offline funksjonalitet og caching
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">App Manifest</h4>
                  <p className="text-sm text-muted-foreground">
                    Konfigurerer app-lignende opplevelse
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Offline Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Grunnleggende funksjonalitet uten nettforbindelse
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceOptimizer />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWADashboard;