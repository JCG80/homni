
import { Button } from '@/components/ui/button';

interface LoadingErrorProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const LoadingIndicator = () => (
  <div className="flex items-center justify-center py-4">
    <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
  </div>
);

export const ErrorDisplay = ({ error, onRetry }: { error: string, onRetry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
    <p className="text-sm">{error}</p>
    {onRetry && (
      <Button 
        onClick={onRetry} 
        variant="outline" 
        size="sm" 
        className="mt-2"
      >
        Retry
      </Button>
    )}
  </div>
);

export const LoadingStates = ({ loading, error, onRetry }: LoadingErrorProps) => {
  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }
  
  return null;
};
