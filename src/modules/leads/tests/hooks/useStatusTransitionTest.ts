
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { isStatusTransitionAllowed } from '../../utils/lead-utils';
import { LeadStatus } from '@/types/leads';
import { updateLeadStatus } from '../../api/lead-update';

export function useStatusTransitionTest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [currentStatus, setCurrentStatus] = useState<LeadStatus | null>(null);
  const [targetStatus, setTargetStatus] = useState<LeadStatus>('new');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Fetch the current lead status
  const fetchLeadStatus = async () => {
    if (!leadId) {
      setError('Please enter a lead ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setStatusCode(null);

      const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('id', leadId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(`Lead with ID ${leadId} not found`);
      }

      setCurrentStatus(data.status as LeadStatus);
      setTargetStatus(data.status as LeadStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lead status');
      setCurrentStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Test status transition using the updateLeadStatus function
  const testStatusTransition = async () => {
    if (!currentStatus || !leadId) {
      setError('Please fetch a lead first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setStatusCode(null);

      const updatedLead = await updateLeadStatus(leadId, targetStatus);
      
      setResult(updatedLead);
      setStatusCode(200);
    } catch (err: any) {
      setError(err.message || 'Failed to update lead status');
      setStatusCode(err.code || 400);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a transition is allowed based on the current status
  const isTransitionAllowed = (status: LeadStatus) => {
    if (!currentStatus) return false;
    return isStatusTransitionAllowed(currentStatus, status);
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
