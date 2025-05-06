
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStatusTransitionTest } from '../hooks/useStatusTransitionTest';
import { LeadIdInput } from './LeadIdInput';
import { StatusTransitionSelector } from './StatusTransitionSelector';
import { TransitionTestButton } from './TransitionTestButton';
import { TransitionTestResult } from './TransitionTestResult';

export function StatusTransitionTest() {
  const {
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
  } = useStatusTransitionTest();
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Test Status Transition Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-medium">Status Transition Validation</h3>
          <p className="text-sm text-muted-foreground">
            Test lead status transitions based on the allowed transition rules.
          </p>
        </div>
        
        <LeadIdInput
          leadId={leadId}
          setLeadId={setLeadId}
          isLoading={isLoading}
          fetchLeadStatus={fetchLeadStatus}
          currentStatus={currentStatus}
        />
        
        {currentStatus && (
          <div className="space-y-6">
            <StatusTransitionSelector
              currentStatus={currentStatus}
              targetStatus={targetStatus}
              setTargetStatus={setTargetStatus}
              isTransitionAllowed={isTransitionAllowed}
            />
            
            <TransitionTestButton
              isDisabled={!currentStatus || !user}
              isLoading={isLoading}
              onClick={testStatusTransition}
            />
          </div>
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
