
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LeadStatus } from '@/types/leads-canonical';

interface LeadIdInputProps {
  leadId: string;
  setLeadId: (id: string) => void;
  isLoading: boolean;
  fetchLeadStatus: () => Promise<void>;
  currentStatus: LeadStatus | null;
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
      <label className="text-sm font-medium mb-1 block">Lead ID</label>
      <div className="flex space-x-2">
        <Input
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          placeholder="Enter lead ID"
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          onClick={fetchLeadStatus}
          disabled={!leadId || isLoading}
          variant="outline"
        >
          {isLoading ? "Loading..." : "Fetch Lead"}
        </Button>
      </div>
      
      {currentStatus && (
        <div className="text-sm text-green-600 mt-2">
          Found lead with status: <strong>{currentStatus}</strong>
        </div>
      )}
    </div>
  );
}
