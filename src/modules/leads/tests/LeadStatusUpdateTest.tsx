
import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getLeadById, updateLeadStatus } from '../api/leads-api';
import { LeadStatus, LEAD_STATUSES } from '../types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export function LeadStatusUpdateTest() {
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Lead Status Update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="leadId">Lead ID</Label>
          <Input 
            id="leadId" 
            value={leadId} 
            onChange={(e) => setLeadId(e.target.value)} 
            placeholder="Enter lead ID to update"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">New Status</Label>
          <Select 
            value={status} 
            onValueChange={(value) => setStatus(value as LeadStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
            <p className="font-medium">Response (Status: {statusCode})</p>
            <pre className="text-xs overflow-auto mt-2">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          onClick={testUpdateStatus}
          disabled={isLoading || !user || !leadId}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Test Status Update'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LeadStatusUpdateTest;
