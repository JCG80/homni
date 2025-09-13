/**
 * SmartBreadcrumbs - Intelligent breadcrumb navigation with context-aware suggestions
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationBreadcrumbs } from '@/hooks/useUnifiedNavigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface SmartBreadcrumbsProps {
  className?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  maxItems?: number;
}

export const SmartBreadcrumbs: React.FC<SmartBreadcrumbsProps> = ({
  className = '',
  showHomeButton = true,
  showBackButton = true,
  maxItems = 4
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const breadcrumbs = useNavigationBreadcrumbs(location.pathname);

  // Don't show breadcrumbs for homepage
  if (location.pathname === '/') return null;

  // Truncate breadcrumbs if too many
  const displayBreadcrumbs = breadcrumbs.length > maxItems 
    ? [breadcrumbs[0], { title: '...', href: '', icon: null }, ...breadcrumbs.slice(-2)]
    : breadcrumbs;

  return (
    <motion.nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="p-1 h-auto hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      {showHomeButton && (
        <Link 
          to="/" 
          className="flex items-center hover:text-primary transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
      )}

      {displayBreadcrumbs.map((crumb, index) => (
        <React.Fragment key={`${crumb.href}-${index}`}>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          
          {crumb.title === '...' ? (
            <span className="text-muted-foreground">...</span>
          ) : index === displayBreadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground truncate">
              {crumb.title}
            </span>
          ) : (
            <Link
              to={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {crumb.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
};