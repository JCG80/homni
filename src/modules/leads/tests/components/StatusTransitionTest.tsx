
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadIdInput } from './LeadIdInput';
import { StatusTransitionSelector } from './StatusTransitionSelector';
import { TransitionTestButton } from './TransitionTestButton';
import { TransitionTestResult } from './TransitionTestResult';
import { useStatusTransitionTest } from '../hooks/useStatusTransitionTest';

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
              isTransitionAllowed={isTransitionAllowed}
            />

            <TransitionTestButton
              isDisabled={!isTransitionAllowed || !leadId}
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
