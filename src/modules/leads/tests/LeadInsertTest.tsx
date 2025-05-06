
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResultDisplay } from './components/TestResultDisplay';
import { TestActionButtons } from './components/TestActionButtons';
import { useLeadInsertTest } from './hooks/useLeadInsertTest';

export function LeadInsertTest() {
  const {
    user,
    isLoading,
    result,
    error,
    statusCode,
    testValidData,
    testInvalidStatus,
    testUnauthorizedSubmission
  } = useLeadInsertTest();

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Test insertLead() Function</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Test with Valid and Invalid Data</h3>
          <p className="text-sm text-muted-foreground">
            These tests will run insertLead with different data to verify its functionality.
          </p>
        </div>

        <TestResultDisplay 
          error={error}
          statusCode={statusCode}
          result={result}
        />
      </CardContent>
      <CardFooter className="gap-2 flex flex-wrap">
        <TestActionButtons
          isLoading={isLoading}
          isUserLoggedIn={!!user}
          onTestValidData={testValidData}
          onTestInvalidStatus={testInvalidStatus}
          onTestUnauthorizedSubmission={testUnauthorizedSubmission}
        />
      </CardFooter>
    </Card>
  );
}
