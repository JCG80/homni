
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { LeadStatus } from '@/types/leads';
import { fetchLeadStatus } from '../../api/lead-fetch';
import { updateLeadStatus } from '../../api/lead-update';
import { isStatusTransitionAllowed } from '../../utils/lead-utils';

export function useStatusTransitionTest() {
  const [leadId, setLeadId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus | null>(null);
  const [targetStatus, setTargetStatus] = useState<LeadStatus>('new');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const fetchLeadStatus = async () => {
    if (!leadId.trim()) {
      toast({
        title: "Mangler lead ID",
        description: "Vennligst oppgi en gyldig ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentStatus(null);
    setError(null);
    setStatusCode(null);
    setResult(null);

    try {
      const { status, data, error: apiError } = await fetchLeadStatus(leadId);
      
      setStatusCode(status);
      
      if (apiError || !data) {
        setError(apiError?.message || 'Kunne ikke hente lead-status');
        toast({
          title: 'Feil ved henting',
          description: 'Kunne ikke hente lead-status',
          variant: 'destructive',
        });
        return;
      }
      
      setCurrentStatus(data.status);
      setResult(data);
      
      toast({
        title: 'Lead funnet',
        description: `Lead med status "${data.status}" ble funnet`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uventet feil oppstod');
      toast({
        title: 'Feil ved henting',
        description: 'En feil oppstod ved henting av lead',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testStatusTransition = async () => {
    if (!leadId.trim() || !currentStatus) {
      toast({
        title: "Mangler informasjon",
        description: "Hent lead-status først",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusCode(null);
    setResult(null);

    try {
      const { data, error: apiError, status } = await updateLeadStatus(leadId, targetStatus);
      
      setStatusCode(status);
      
      if (apiError) {
        setError(apiError.message);
        toast({
          title: 'Oppdatering feilet',
          description: apiError.message,
          variant: 'destructive',
        });
        return;
      }
      
      setResult(data);
      setCurrentStatus(targetStatus);
      
      toast({
        title: 'Status oppdatert',
        description: `Lead ble oppdatert til "${targetStatus}"`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uventet feil oppstod');
      toast({
        title: 'Oppdatering feilet',
        description: 'En feil oppstod ved oppdatering av lead-status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isTransitionAllowed = currentStatus 
    ? isStatusTransitionAllowed(currentStatus, targetStatus)
    : false;

  return {
    leadId,
    setLeadId,
    isLoading,
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
