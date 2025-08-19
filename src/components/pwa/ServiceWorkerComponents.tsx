import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceWorkerUpdateBannerProps {
  className?: string;
}

export function ServiceWorkerUpdateBanner({ className }: ServiceWorkerUpdateBannerProps) {
  const { needsUpdate, updateServiceWorker, isRegistered } = useServiceWorker();
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (!isRegistered || !needsUpdate || isDismissed) {
    return null;
  }

  const handleUpdate = () => {
    updateServiceWorker();
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 left-4 right-4 z-50 ${className}`}
      >
        <Card className="border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">
                  Oppdatering tilgjengelig
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  En ny versjon av appen er klar. Oppdater for å få de nyeste funksjonene.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className="text-xs h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Oppdater
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-xs h-8"
                >
                  Senere
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-16 left-4 right-4 z-40 ${className}`}
    >
      <Card className="border-yellow-500 bg-yellow-50 border">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Du er offline. Noen funksjoner kan være begrenset.
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { isRegistered } = useServiceWorker();
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-muted-foreground">
        {isOnline ? 'Online' : 'Offline'}
        {isRegistered && ' • PWA'}
      </span>
    </div>
  );
}