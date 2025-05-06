
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

  // Test with required fields only
  const testRequiredFieldsOnly = async () => {
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
      const requiredData = createTestLead({
        title: 'Test Required Fields Only',
        description: 'Testing insertLead with only required fields',
        category: 'bolig',
        status: 'new' as LeadStatus,
        submitted_by: user.id,
      });
      
      const result = await insertLead(requiredData);
      setResult(result);
      toast({
        title: 'Success',
        description: 'Lead inserted with required fields only',
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

  // Test with all fields including optional ones
  const testAllFields = async () => {
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
      const allFieldsData = createTestLead({
        title: 'Test All Fields',
        description: 'Testing insertLead with all fields including optional ones',
        category: 'næring',
        status: LEAD_STATUSES[0], // Using the 'new' status from the constants
        submitted_by: user.id,
        priority: 'high',
        content: { additionalInfo: 'This is some extra content data' },
        provider_id: 'test-provider-id',
      });
      
      const result = await insertLead(allFieldsData);
      setResult(result);
      toast({
        title: 'Success',
        description: 'Lead inserted with all fields',
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Test insertLead() Function</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Test Options</h3>
          <p className="text-sm text-muted-foreground">
            Click the buttons below to test the insertLead function with different sets of fields.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error occurred:</p>
            <p className="text-sm">{error}</p>
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
      <CardFooter className="gap-2">
        <Button
          onClick={testRequiredFieldsOnly}
          disabled={isLoading || !user}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Required Fields'
          )}
        </Button>
        
        <Button
          onClick={testAllFields}
          disabled={isLoading || !user}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test All Fields'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
