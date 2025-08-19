import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { Smartphone, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWAInstallBannerProps {
  className?: string;
}

export function PWAInstallBanner({ className }: PWAInstallBannerProps) {
  const { canInstall, promptInstall, dismissInstall } = usePWA();
  const [isDismissed, setIsDismissed] = React.useState(() => {
    return localStorage.getItem('pwa-install-dismissed') === 'true';
  });

  const handleInstall = async () => {
    await promptInstall();
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    dismissInstall();
  };

  if (!canInstall || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
      >
        <Card className="border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">
                  Installer Homni-appen
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Få rask tilgang og push-varsler ved å installere appen på enheten din.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="text-xs h-8"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Installer
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Avvis</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}