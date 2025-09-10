import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Download, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { toast } from '@/components/ui/use-toast';

export const PWAInstallPrompt = () => {
  const { canInstall, promptInstall, dismissInstall, isStandalone } = usePWA();

  if (!canInstall || isStandalone) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Installer Homni
        </CardTitle>
        <CardDescription>
          Få en app-lignende opplevelse ved å installere Homni på enheten din
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={promptInstall} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Installer App
          </Button>
          <Button variant="outline" onClick={dismissInstall} size="sm">
            Ikke nå
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const PWAStatus = () => {
  const { isInstalled, isStandalone } = usePWA();
  const { isRegistered, needsUpdate, updateServiceWorker } = useServiceWorker();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    updateServiceWorker();
    toast({
      title: "App oppdatert",
      description: "Siden laster på nytt med den nyeste versjonen.",
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-600" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-600" />
      )}
      
      {isStandalone && (
        <Badge variant="secondary">PWA Mode</Badge>
      )}
      
      {isInstalled && (
        <Badge variant="default">Installert</Badge>
      )}
      
      {isRegistered && (
        <Badge variant="outline">SW Aktiv</Badge>
      )}
      
      {needsUpdate && (
        <Button variant="ghost" size="sm" onClick={handleUpdate}>
          Oppdater
        </Button>
      )}
    </div>
  );
};

export const NotificationManager = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported] = useState('Notification' in window && 'serviceWorker' in navigator);

  const requestPermission = async () => {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast({
        title: "Varsler aktivert",
        description: "Du vil nå motta varsler om viktige oppdateringer.",
      });
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Test varsel fra Homni', {
          body: 'Dette er et test varsel for å sikre at varsler fungerer.',
          icon: '/android-chrome-192x192.png',
          badge: '/android-chrome-192x192.png',
          tag: 'test',
        });
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Varsler støttes ikke i denne nettleseren.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Varsler
        </CardTitle>
        <CardDescription>
          Få varsler om nye leads, eiendomsoppdateringer og viktige meldinger
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'default' && (
          <Button onClick={requestPermission}>
            <Bell className="h-4 w-4 mr-2" />
            Aktiver varsler
          </Button>
        )}
        
        {permission === 'granted' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">Varsler aktivert</Badge>
              <Button variant="outline" size="sm" onClick={sendTestNotification}>
                Test varsel
              </Button>
            </div>
          </div>
        )}
        
        {permission === 'denied' && (
          <p className="text-sm text-muted-foreground">
            Varsler er blokkert. Aktiver i nettleserinnstillingene for å motta varsler.
          </p>
        )}
      </CardContent>
    </Card>
  );
};