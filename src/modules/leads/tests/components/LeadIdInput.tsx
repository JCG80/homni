
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Search } from 'lucide-react';

interface LeadIdInputProps {
  leadId: string;
  setLeadId: (id: string) => void;
  isLoading: boolean;
  fetchLeadStatus: () => Promise<void>;
  currentStatus: string | null;
}

export function LeadIdInput({ 
  leadId, 
  setLeadId, 
  isLoading, 
  fetchLeadStatus,
  currentStatus
}: LeadIdInputProps) {
  return (
    <div className="space-y-2">
      <label className="font-medium mb-1 block">Lead ID</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Enter Lead ID"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        <Button 
          onClick={fetchLeadStatus} 
          disabled={!leadId || isLoading}
          variant="secondary"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin mr-2" /> 
              Loading...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" /> 
              Fetch
            </>
          )}
        </Button>
      </div>
      
      {currentStatus && (
        <div className="text-sm text-green-600 mt-1 flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          Found lead with status: <span className="font-medium ml-1">{currentStatus}</span>
        </div>
      )}
    </div>
  );
}
