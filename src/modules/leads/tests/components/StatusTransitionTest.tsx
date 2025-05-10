
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadIdInput } from './LeadIdInput';
import { StatusTransitionSelector } from './StatusTransitionSelector';
import { TransitionTestButton } from './TransitionTestButton';
import { TransitionTestResult } from './TransitionTestResult';
import { useStatusTransitionTest } from '../hooks/useStatusTransitionTest';
import { LeadStatus } from '@/types/leads';

export function StatusTransitionTest() {
  const {
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
  } = useStatusTransitionTest();

  // Function to check if a transition is allowed for a specific status
  const checkTransition = (status: LeadStatus) => {
    return isTransitionAllowed(status);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Test Status Transitions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <LeadIdInput
          leadId={leadId}
          setLeadId={setLeadId}
          isLoading={isLoading}
          fetchLeadStatus={fetchLeadStatus}
          currentStatus={currentStatus}
        />

        {currentStatus && (
          <>
            <StatusTransitionSelector
              currentStatus={currentStatus}
              targetStatus={targetStatus}
              setTargetStatus={setTargetStatus}
              isTransitionAllowed={checkTransition}
            />

            <TransitionTestButton
              isDisabled={!isTransitionAllowed(targetStatus) || !leadId}
              isLoading={isLoading}
              onClick={testStatusTransition}
            />
          </>
        )}

        <TransitionTestResult
          result={result}
          error={error}
          statusCode={statusCode}
        />
      </CardContent>
    </Card>
  );
}
