
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusUpdateForm } from './components/StatusUpdateForm';
import { TestResultDisplay } from './components/TestResultDisplay';
import { useLeadStatusUpdateTest } from './hooks/useLeadStatusUpdateTest';

export function LeadStatusUpdateTest() {
  const {
    user,
    isLoading,
    leadId,
    setLeadId,
    status,
    setStatus,
    result,
    error,
    statusCode,
    testUpdateStatus
  } = useLeadStatusUpdateTest();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Lead Status Update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusUpdateForm
          leadId={leadId}
          setLeadId={setLeadId}
          status={status}
          setStatus={setStatus}
        />
        
        <TestResultDisplay 
          error={error}
          statusCode={statusCode}
          result={result}
        />
      </CardContent>
      <CardFooter>
        <StatusUpdateButton 
          isLoading={isLoading} 
          isUserLoggedIn={!!user} 
          leadId={leadId} 
          onTestUpdateStatus={testUpdateStatus} 
        />
      </CardFooter>
    </Card>
  );
}

// Let's create a simple button component
function StatusUpdateButton({ isLoading, isUserLoggedIn, leadId, onTestUpdateStatus }) {
  return (
    <Button
      onClick={onTestUpdateStatus}
      disabled={isLoading || !isUserLoggedIn || !leadId}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        'Test Status Update'
      )}
    </Button>
  );
}

// Missing import for Button and Loader
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export default LeadStatusUpdateTest;
