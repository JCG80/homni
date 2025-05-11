
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '@/modules/auth/types/types';

interface TestUserButtonProps {
  name: string;
  role: UserRole;
  email: string;
  isMissing: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const TestUserButton = ({ 
  name, 
  role, 
  email, 
  isMissing, 
  isLoading, 
  onClick 
}: TestUserButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="w-full text-xs"
      variant={isMissing ? "destructive" : "outline"}
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Logger inn...
        </>
      ) : isMissing ? (
        <>
          <AlertCircle className="mr-2 h-3 w-3" />
          {name} ({role}) - Ikke opprettet
        </>
      ) : (
        <>
          {name} ({role})
        </>
      )}
    </Button>
  );
};
