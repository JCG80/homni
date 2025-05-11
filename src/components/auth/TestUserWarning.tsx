
import { 
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestUserWarningProps {
  missingUsers: string[];
  onSetupClick: () => void;
}

export const TestUserWarning = ({ missingUsers, onSetupClick }: TestUserWarningProps) => {
  if (missingUsers.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Test users missing</AlertTitle>
      <AlertDescription className="text-xs">
        Some test users are not set up in the database.
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSetupClick}
          className="mt-2 w-full"
        >
          Setup Test Users
        </Button>
      </AlertDescription>
    </Alert>
  );
};
