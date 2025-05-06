
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface TestActionButtonsProps {
  isLoading: boolean;
  isUserLoggedIn: boolean;
  onTestValidData: () => void;
  onTestInvalidStatus: () => void;
  onTestUnauthorizedSubmission: () => void;
}

export const TestActionButtons = ({
  isLoading,
  isUserLoggedIn,
  onTestValidData,
  onTestInvalidStatus,
  onTestUnauthorizedSubmission
}: TestActionButtonsProps) => {
  return (
    <>
      <Button
        onClick={onTestValidData}
        disabled={isLoading || !isUserLoggedIn}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Valid Data'
        )}
      </Button>
      <Button
        onClick={onTestInvalidStatus}
        disabled={isLoading || !isUserLoggedIn}
        variant="outline"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Invalid Status'
        )}
      </Button>
      <Button
        onClick={onTestUnauthorizedSubmission}
        disabled={isLoading || !isUserLoggedIn}
        variant="outline"
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Unauthorized Submission'
        )}
      </Button>
    </>
  );
};
