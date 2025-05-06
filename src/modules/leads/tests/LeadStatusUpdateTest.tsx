
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusUpdateForm } from './components/StatusUpdateForm';
import { TestResultDisplay } from './components/TestResultDisplay';
import { useLeadStatusUpdateTest } from './hooks/useLeadStatusUpdateTest';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { updateLeadStatus } from '../api/leads-api';
import { toast } from '@/hooks/use-toast';

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

  const testKnownLead = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to test',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await updateLeadStatus('db7e8d51-2a8d-4a8d-a3c5-d4e8ea551122', 'completed');
      toast({
        title: 'Status Updated',
        description: '✅ Lead ble oppdatert til "completed"',
      });
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: '🚫 Klarte ikke å oppdatere lead-status',
        variant: 'destructive',
      });
    }
  };

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
      <CardFooter className="flex flex-wrap gap-2">
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

        <Button
          variant="secondary"
          onClick={testKnownLead}
          disabled={!user}
        >
          Test "completed" status på known-lead
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LeadStatusUpdateTest;
