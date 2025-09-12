import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { getBreadcrumbs } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedBreadcrumbProps {
  className?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  maxItems?: number;
}

export const EnhancedBreadcrumb: React.FC<EnhancedBreadcrumbProps> = ({
  className,
  showBackButton = true,
  showHomeButton = true,
  maxItems = 4
}) => {
  const location = useLocation();
  const { role, isAuthenticated } = useAuth();
  
  const currentRole = isAuthenticated ? (role as UserRole) : 'guest';
  const breadcrumbs = getBreadcrumbs(location.pathname, currentRole);
  
  // Limit breadcrumbs to maxItems
  const displayBreadcrumbs = breadcrumbs.length > maxItems 
    ? [
        breadcrumbs[0], 
        { title: '...', href: '', icon: undefined }, 
        ...breadcrumbs.slice(-2)
      ]
    : breadcrumbs;

  const handleBack = () => {
    window.history.back();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  if (breadcrumbs.length <= 1) return null;

  return (
    <motion.div
      className={cn('flex items-center gap-4 py-2', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back button */}
      {showBackButton && (
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 px-2 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Gå tilbake</span>
          </Button>
        </motion.div>
      )}

      {/* Breadcrumb navigation */}
      <motion.div variants={itemVariants} className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home button */}
            {showHomeButton && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="flex items-center gap-1 hover:text-primary">
                      <Home className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Hjem</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {displayBreadcrumbs.length > 0 && <BreadcrumbSeparator />}
              </>
            )}

            <AnimatePresence>
              {displayBreadcrumbs.map((breadcrumb, index) => {
                const isLast = index === displayBreadcrumbs.length - 1;
                const isEllipsis = breadcrumb.title === '...';
                const Icon = breadcrumb.icon;

                return (
                  <motion.div
                    key={`${breadcrumb.href}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="flex items-center gap-2">
                           {Icon && typeof Icon === 'function' && <Icon className="h-4 w-4" />}
                          <span>{breadcrumb.title}</span>
                        </BreadcrumbPage>
                      ) : isEllipsis ? (
                        <span className="text-muted-foreground">...</span>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={breadcrumb.href}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            {Icon && typeof Icon === 'function' && <Icon className="h-4 w-4" />}
                            <span>{breadcrumb.title}</span>
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>
    </motion.div>
  );
};