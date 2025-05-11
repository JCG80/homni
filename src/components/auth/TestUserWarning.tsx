
import { 
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestUserWarningProps {
  missingUsers: string[];
  onSetupClick: () => void;
  isSettingUp?: boolean;
}

export const TestUserWarning = ({ missingUsers, onSetupClick, isSettingUp = false }: TestUserWarningProps) => {
  if (missingUsers.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Test users missing</AlertTitle>
      <AlertDescription className="text-xs">
        {missingUsers.length === 1 
          ? 'En testbruker mangler i databasen.' 
          : `${missingUsers.length} testbrukere mangler i databasen.`
        }
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSetupClick}
          disabled={isSettingUp}
          className="mt-2 w-full"
        >
          {isSettingUp ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Setter opp testbrukere...
            </>
          ) : (
            'Setup Test Users'
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
