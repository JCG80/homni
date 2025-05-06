
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getLeadById, updateLeadStatus } from '../../api/leads-api';
import { LeadStatus } from '../../types/types';
import { toast } from '@/hooks/use-toast';
import { ALLOWED_STATUS_TRANSITIONS } from '../../constants/lead-constants';

export function useStatusTransitionTest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [currentStatus, setCurrentStatus] = useState<LeadStatus | null>(null);
  const [targetStatus, setTargetStatus] = useState<LeadStatus>('new');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  
  // Fetch current lead status
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
      setTargetStatus(lead.status as LeadStatus); // Reset target status to current
      toast({
        title: 'Lead Found',
        description: `Current status is: ${lead.status}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lead');
      toast({
        title: 'Error',
        description: 'Failed to fetch lead status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test status transition
  const testStatusTransition = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User must be logged in to test',
        variant: 'destructive',
      });
      return;
    }

    if (!leadId || !currentStatus) {
      toast({
        title: 'Error',
        description: 'Please fetch lead status first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Check if transition is allowed using our rules
      const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
      const isAllowed = currentStatus === targetStatus || allowedTransitions.includes(targetStatus);
      
      console.log(`Testing transition from ${currentStatus} to ${targetStatus}`);
      console.log(`Allowed transitions for ${currentStatus}:`, allowedTransitions);
      console.log(`Is this transition allowed? ${isAllowed}`);
      
      // Attempt the status update
      const result = await updateLeadStatus(leadId, targetStatus);
      
      setResult(result);
      setStatusCode(200);
      setCurrentStatus(targetStatus); // Update current status on success
      
      toast({
        title: 'Status Updated',
        description: `Lead status updated successfully to ${targetStatus}`,
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

  // Check if a transition to the target status is allowed
  const isTransitionAllowed = (status: LeadStatus): boolean => {
    if (!currentStatus) return false;
    if (currentStatus === status) return true;
    
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(status);
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
