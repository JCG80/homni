
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface LeadIdFetcherProps {
  leadId: string;
  setLeadId: (id: string) => void;
  isLoading: boolean;
  fetchLeadStatus: () => Promise<void>;
  currentStatus: string | null;
}

export function LeadIdFetcher({
  leadId,
  setLeadId,
  isLoading,
  fetchLeadStatus,
  currentStatus
}: LeadIdFetcherProps) {
  return (
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
  );
}
