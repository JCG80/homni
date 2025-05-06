
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { insertLead } from '../../api/leads-api';
import { Lead, LeadStatus } from '../../types/types';
import { toast } from '@/hooks/use-toast';
import { createTestLead } from '../utils';

export const useLeadInsertTest = () => {
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

  // Test unauthorized submission (trying to submit as another user)
  const testUnauthorizedSubmission = async () => {
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
        title: 'Uautorisert innsending',
        description: 'Skal feile pga. policy',
        category: 'Maler',
        status: 'new' as LeadStatus,
        company_id: 'known-company-id',
        submitted_by: 'some-other-user-id' // Not the same as auth.uid()
      };
      
      console.log('Testing unauthorized submission:', testData);
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
        title: 'Authorization Working',
        description: err instanceof Error ? err.message : 'Unauthorized submission was correctly rejected',
        variant: 'default',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    result,
    error,
    statusCode,
    testValidData,
    testInvalidStatus,
    testUnauthorizedSubmission
  };
};
