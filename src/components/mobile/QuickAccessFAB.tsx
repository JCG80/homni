import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home, Search, Building, Target, DollarSign, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

export const QuickAccessFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuth();

  const getQuickActions = (): QuickAction[] => {
    switch (role) {
      case 'user':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard', color: 'bg-primary' },
          { id: 'leads', label: 'Leads', icon: Target, href: '/leads', color: 'bg-accent' },
          { id: 'property', label: 'Eiendom', icon: Building, href: '/property', color: 'bg-secondary' },
          { id: 'sales', label: 'Salg', icon: DollarSign, href: '/sales', color: 'bg-success' },
        ];
      case 'company':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard/company', color: 'bg-primary' },
          { id: 'leads', label: 'Lead Management', icon: Target, href: '/leads/manage', color: 'bg-accent' },
          { id: 'portfolio', label: 'Portefølje', icon: Building, href: '/property/portfolio', color: 'bg-secondary' },
          { id: 'pipeline', label: 'Pipeline', icon: DollarSign, href: '/sales/pipeline', color: 'bg-success' },
        ];
      case 'admin':
      case 'master_admin':
        return [
          { id: 'admin', label: 'Admin', icon: Home, href: '/admin', color: 'bg-primary' },
          { id: 'leads', label: 'Alle Leads', icon: Target, href: '/admin/leads', color: 'bg-accent' },
          { id: 'users', label: 'Brukere', icon: Building, href: '/admin/users', color: 'bg-secondary' },
          { id: 'modules', label: 'Moduler', icon: FileText, href: '/admin/modules', color: 'bg-success' },
        ];
      default:
        return [
          { id: 'home', label: 'Forside', icon: Home, href: '/', color: 'bg-primary' },
          { id: 'compare', label: 'Sammenlign', icon: Search, href: '/sammenlign', color: 'bg-accent' },
        ];
    }
  };

  const quickActions = getQuickActions();

  const handleActionClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse gap-3"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 50, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  x: 50, 
                  y: 20,
                  transition: { delay: (quickActions.length - index) * 0.05 }
                }}
              >
                <Button
                  onClick={() => handleActionClick(action.href)}
                  size="lg"
                  className={cn(
                    "w-14 h-14 rounded-full shadow-lg",
                    "text-white hover:scale-110 transition-transform",
                    action.color
                  )}
                  aria-label={action.label}
                >
                  <action.icon className="h-6 w-6" />
                </Button>
                <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 text-foreground px-2 py-1 rounded text-sm whitespace-nowrap shadow-md">
                  {action.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "w-16 h-16 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Lukk hurtigmeny" : "Åpne hurtigmeny"}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
      </Button>
    </div>
  );
};