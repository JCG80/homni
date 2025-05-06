
import React from 'react';
import { LeadStatus, LEAD_STATUSES } from '../../types/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface StatusTransitionSelectorProps {
  currentStatus: LeadStatus | null;
  targetStatus: LeadStatus;
  setTargetStatus: (status: LeadStatus) => void;
  isTransitionAllowed: (status: LeadStatus) => boolean;
}

export function StatusTransitionSelector({
  currentStatus,
  targetStatus,
  setTargetStatus,
  isTransitionAllowed
}: StatusTransitionSelectorProps) {
  if (!currentStatus) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium mb-1 block">Current Status</label>
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded text-gray-800 border">
            {currentStatus}
          </div>
        </div>
      </div>

      <div>
        <label className="font-medium mb-1 block">Target Status</label>
        <div className="space-y-2">
          <Select
            value={targetStatus}
            onValueChange={(value) => setTargetStatus(value as LeadStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => {
                const allowed = isTransitionAllowed(status);
                return (
                  <SelectItem 
                    key={status} 
                    value={status}
                    disabled={!allowed && status !== currentStatus}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{status}</span>
                      {!allowed && status !== currentStatus ? (
                        <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-700">
                          Not allowed
                        </Badge>
                      ) : status === currentStatus ? (
                        <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                          Current
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700">
                          Allowed
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <div className="text-xs text-gray-500">
            {targetStatus === currentStatus ? (
              <span>No change (keeping current status)</span>
            ) : isTransitionAllowed(targetStatus) ? (
              <span>This transition is allowed</span>
            ) : (
              <span className="text-red-500">This transition is not allowed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
