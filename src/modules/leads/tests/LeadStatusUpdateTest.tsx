
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusUpdateForm } from './components/StatusUpdateForm';
import { TestResultDisplay } from './components/TestResultDisplay';
import { useLeadStatusUpdateTest } from './hooks/useLeadStatusUpdateTest';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

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
        <Button
          onClick={testUpdateStatus}
          disabled={isLoading || !user || !leadId}
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
      </CardFooter>
    </Card>
  );
}

export default LeadStatusUpdateTest;
