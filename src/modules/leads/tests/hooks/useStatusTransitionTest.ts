
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getLeadById, updateLeadStatus } from '../../api';
import { LeadStatus } from '../../types/types';
import { isStatusTransitionAllowed } from '../../utils/lead-utils';
import { toast } from '@/hooks/use-toast';

export function useStatusTransitionTest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [currentStatus, setCurrentStatus] = useState<LeadStatus | null>(null);
  const [targetStatus, setTargetStatus] = useState<LeadStatus>('new');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Fetch a lead to see its current status
  const fetchLeadStatus = async () => {
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
      const lead = await getLeadById(leadId);
      setCurrentStatus(lead.status as LeadStatus);
      setTargetStatus(lead.status as LeadStatus);
      toast({
        title: 'Lead Found',
        description: `Current status: ${lead.status}`,
      });
    } catch (err) {
      setCurrentStatus(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch lead');
      toast({
        title: 'Error',
        description: 'Failed to fetch lead with the provided ID',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if transition is allowed based on lead-utils rules
  const isTransitionAllowed = (status: LeadStatus) => {
    if (!currentStatus) return false;
    return isStatusTransitionAllowed(currentStatus, status);
  };

  // Test the status transition
  const testStatusTransition = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to test',
        variant: 'destructive',
      });
      return;
    }

    if (!leadId || !currentStatus || !targetStatus) {
      toast({
        title: 'Error',
        description: 'Please enter a lead ID and select status',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setStatusCode(null);

    try {
      console.log(`Testing transition from ${currentStatus} to ${targetStatus}`);
      
      const result = await updateLeadStatus(leadId, targetStatus);
      
      setResult(result);
      setStatusCode(200);
      
      toast({
        title: 'Status Updated',
        description: `Successfully updated status to ${targetStatus}`,
      });
      
      // Update current status to reflect the new status
      setCurrentStatus(targetStatus);
      
    } catch (err) {
      console.error('Error in status transition test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatusCode(400);
      
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
    currentStatus,
    targetStatus,
    setTargetStatus,
    result,
    error,
    statusCode,
    fetchLeadStatus,
    testStatusTransition,
    isTransitionAllowed
  };
}
