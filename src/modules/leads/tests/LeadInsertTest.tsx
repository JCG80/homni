
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { insertLead } from '../api/leads-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead, LeadStatus } from '../types/types';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { LEAD_STATUSES } from '../constants/lead-constants';
import { createTestLead } from './utils';

export const LeadInsertTest = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Test with required fields only
  const testValidData = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to test',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const testData = {
        title: 'Test-lead fra insertLead',
        description: 'Testbeskrivelse',
        category: 'Elektriker',
        status: 'new' as LeadStatus,
        submitted_by: user.id,
        // For testing purposes, we're using the same user ID as company_id
        // In a real application, you would use an actual company ID
        company_id: user.id,
      };
      
      console.log('Testing insertLead with data:', testData);
      const result = await insertLead(testData);
      setResult(result);
      setStatusCode(201); // Assuming successful creation
      toast({
        title: 'Success',
        description: 'Lead inserted successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test with invalid status
  const testInvalidStatus = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to test',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const testData = {
        title: 'Feil status',
        description: 'Tester feil enum',
        category: 'Elektriker',
        status: 'invalid-status' as any, // This should trigger our validation
        submitted_by: user.id,
        company_id: user.id,
      };
      
      console.log('Testing insertLead with invalid status:', testData);
      const result = await insertLead(testData);
      setResult(result);
      setStatusCode(201);
      toast({
        title: 'Success',
        description: 'Lead inserted successfully (but this should not happen)',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Validation Working',
        description: err instanceof Error ? err.message : 'Invalid status was correctly rejected',
        variant: 'default',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error occurred:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {statusCode && !error && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium">Status Code: {statusCode}</p>
            <p className="text-sm">
              {statusCode === 201 ? "✅ Success: Lead was inserted successfully" : "Status code received"}
            </p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium">Success! Lead inserted:</p>
            <pre className="text-xs mt-2 overflow-auto p-2 bg-black/5 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2 flex flex-wrap">
        <Button
          onClick={testValidData}
          disabled={isLoading || !user}
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
          onClick={testInvalidStatus}
          disabled={isLoading || !user}
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
      </CardFooter>
    </Card>
  );
};
