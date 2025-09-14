
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { getLeadById } from '../../api/lead-list';
import { updateLeadStatus } from '../../api/lead-update';
import { LeadStatus } from '@/types/leads-canonical';
import { toast } from "@/hooks/use-toast";

export function useLeadStatusUpdateTest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Test updating lead status
  const testUpdateStatus = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to test',
        variant: 'destructive',
      });
      return;
    }

    if (!leadId) {
      toast({
        title: 'Error',
        description: 'Please enter a lead ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // First, fetch the current lead to display its status
      const currentLead = await getLeadById(leadId);
      console.log('Current lead status:', currentLead.status);
      
      // Try to update the status
      console.log(`Attempting to update lead ${leadId} status from ${currentLead.status} to ${status}`);
      const result = await updateLeadStatus(leadId, status);
      
      setResult(result);
      setStatusCode(200);
      
      toast({
        title: 'Status Updated',
        description: `Lead status updated successfully to ${status}`,
      });
    } catch (err) {
      setStatusCode(400);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update lead status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
