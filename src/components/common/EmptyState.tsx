import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for when no data is available
 * Uses semantic design tokens for consistent theming
 */
export const EmptyState = ({
  title,
  description,
  icon,
  action,
  secondaryAction
}: EmptyStateProps) => {
  const defaultIcon = (
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-8 h-8 text-muted-foreground" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center">
      {icon || defaultIcon}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Pre-configured empty states for common scenarios
 */
export const NoDataFound = ({ entityName = 'data' }: { entityName?: string }) => (
  <EmptyState
    title={`Ingen ${entityName} funnet`}
    description={`Vi fant ingen ${entityName} som matcher dine kriterier. Prøv å justere filtrene eller lag nye ${entityName}.`}
    action={{
      label: 'Oppdater',
      onClick: () => window.location.reload()
    }}
  />
);

export const NetworkError = () => (
  <EmptyState
    title="Nettverksfeil"
    description="Vi har problemer med å koble til serveren. Sjekk internettilkoblingen din og prøv igjen."
    action={{
      label: 'Prøv igjen',
      onClick: () => window.location.reload()
    }}
    secondaryAction={{
      label: 'Gå tilbake',
      onClick: () => window.history.back()
    }}
  />
);

export const AccessDenied = () => (
  <EmptyState
    title="Ingen tilgang"
    description="Du har ikke tilgang til denne siden. Kontakt administrator hvis du mener dette er en feil."
    secondaryAction={{
      label: 'Gå tilbake',
      onClick: () => window.history.back()
    }}
  />
);