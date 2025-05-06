
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestResultDisplay } from './TestResultDisplay';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadStatus, LEAD_STATUSES } from '../../types/types';
import { ALLOWED_STATUS_TRANSITIONS } from '../../constants/lead-constants';
import { getLeadById, updateLeadStatus } from '../../api/leads-api';

export function StatusTransitionTest() {
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">Lead ID</label>
            <input 
              type="text" 
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              placeholder="Enter lead ID"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <Button 
              onClick={fetchLeadStatus} 
              disabled={isLoading || !leadId}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Fetch Status'
              )}
            </Button>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Current Status</label>
            <input 
              type="text" 
              value={currentStatus || ''}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
          </div>
        </div>
        
        {currentStatus && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Status</label>
              <Select
                value={targetStatus}
                onValueChange={(value) => setTargetStatus(value as LeadStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => {
                    const allowed = currentStatus === status || 
                      (ALLOWED_STATUS_TRANSITIONS[currentStatus] || []).includes(status);
                    
                    return (
                      <SelectItem key={status} value={status}>
                        {status} {!allowed && '(Not Allowed)'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
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
