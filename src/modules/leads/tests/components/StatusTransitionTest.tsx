
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { TestResultDisplay } from './TestResultDisplay';
import { LeadIdFetcher } from './LeadIdFetcher';
import { StatusSelector } from './StatusSelector';
import { useStatusTransitionTest } from '../hooks/useStatusTransitionTest';
import { ALLOWED_STATUS_TRANSITIONS } from '../../constants/lead-constants';

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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Status Transition Validation</h3>
          <p className="text-sm text-muted-foreground">
            Test lead status transitions based on the allowed transition rules.
          </p>
        </div>
        
        <LeadIdFetcher
          leadId={leadId}
          setLeadId={setLeadId}
          isLoading={isLoading}
          fetchLeadStatus={fetchLeadStatus}
          currentStatus={currentStatus}
        />
        
        {currentStatus && (
          <div className="space-y-4 pt-2">
            <StatusSelector
              currentStatus={currentStatus}
              targetStatus={targetStatus}
              setTargetStatus={setTargetStatus}
              isTransitionAllowed={isTransitionAllowed}
            />
            
            <div className="mt-2 text-xs">
              <span className="font-medium">Allowed transitions: </span>
              {currentStatus === targetStatus ? (
                <span className="text-gray-500">Same as current</span>
              ) : (ALLOWED_STATUS_TRANSITIONS[currentStatus] || []).length > 0 ? (
                (ALLOWED_STATUS_TRANSITIONS[currentStatus] || []).join(', ')
              ) : (
                <span className="text-red-500">None</span>
              )}
            </div>
            
            <Button
              onClick={testStatusTransition}
              disabled={isLoading || !currentStatus}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Testing Transition...
                </>
              ) : (
                'Test Status Transition'
              )}
            </Button>
          </div>
        )}
        
        <TestResultDisplay 
          error={error}
          statusCode={statusCode}
          result={result}
        />
      </CardContent>
    </Card>
  );
}
