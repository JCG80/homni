import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Lightbulb, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';

interface ContextualHelpProps {
  className?: string;
}

interface HelpItem {
  id: string;
  title: string;
  description: string;
  action?: {
    text: string;
    href: string;
  };
  priority: 'high' | 'medium' | 'low';
  roles: string[];
}

const getContextualHelp = (pathname: string, role: string): HelpItem[] => {
  const baseHelp: Record<string, HelpItem[]> = {
    '/': [
      {
        id: 'homepage-start',
        title: 'Kom i gang med Homni',
        description: 'Få tilbud fra kvalifiserte leverandører på under 3 minutter',
        action: { text: 'Start forespørsel', href: '/wizard' },
        priority: 'high',
        roles: ['guest', 'user']
      }
    ],
    '/dashboard': [
      {
        id: 'dashboard-overview',
        title: 'Dashboard oversikt',
        description: 'Her ser du alle dine aktive forespørsler og tilbud',
        priority: 'medium',
        roles: ['user', 'company']
      },
      {
        id: 'next-steps',
        title: 'Anbefalte neste steg',
        description: 'Sjekk anbefalingene for å få mest mulig ut av plattformen',
        priority: 'high',
        roles: ['user', 'company', 'admin']
      }
    ],
    '/account': [
      {
        id: 'profile-setup',
        title: 'Fullfør profilen din',
        description: 'En komplett profil hjelper leverandører gi deg bedre tilbud',
        action: { text: 'Rediger profil', href: '/profile/edit' },
        priority: 'high',
        roles: ['user', 'company']
      },
      {
        id: 'notification-settings',
        title: 'Tilpass varslingene',
        description: 'Velg hvordan du vil få beskjed om nye tilbud og oppdateringer',
        action: { text: 'Innstillinger', href: '/account/notifications' },
        priority: 'medium',
        roles: ['user', 'company']
      }
    ],
    '/leads': [
      {
        id: 'lead-management',
        title: 'Administrer dine leads',
        description: 'Følg opp potensielle kunder og øk konverteringsraten',
        priority: 'high',
        roles: ['company', 'admin']
      }
    ]
  };

  const pathHelp = baseHelp[pathname] || [];
  return pathHelp.filter(item => item.roles.includes(role));
};

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ className }) => {
  const { t } = useI18n();
  const { role } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [helpItems, setHelpItems] = useState<HelpItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const currentRole = role || 'guest';
    const items = getContextualHelp(location.pathname, currentRole);
    const visibleItems = items.filter(item => !dismissedIds.includes(item.id));
    
    setHelpItems(visibleItems);
    setIsVisible(visibleItems.length > 0);
  }, [location.pathname, role, dismissedIds]);

  useEffect(() => {
    // Load dismissed items from localStorage
    const stored = localStorage.getItem('dismissed-help-items');
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse dismissed help items');
      }
    }
  }, []);

  const dismissHelpItem = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-help-items', JSON.stringify(newDismissed));
  };

  const dismissAll = () => {
    const allIds = helpItems.map(item => item.id);
    const newDismissed = [...dismissedIds, ...allIds];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-help-items', JSON.stringify(newDismissed));
    setIsVisible(false);
  };

  if (!isVisible || helpItems.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}
      >
        <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-sm">Tips og hjelp</h3>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissAll}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {helpItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        <Badge 
                          variant={item.priority === 'high' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.priority === 'high' ? 'Viktig' : item.priority === 'medium' ? 'Anbefalt' : 'Tips'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissHelpItem(item.id)}
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {item.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = item.action!.href;
                        dismissHelpItem(item.id);
                      }}
                      className="w-full justify-between text-xs"
                    >
                      {item.action.text}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};