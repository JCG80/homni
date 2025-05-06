
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus, LEAD_STATUSES } from '../../types/types';

interface StatusSelectorProps {
  currentStatus: LeadStatus | null;
  targetStatus: LeadStatus;
  setTargetStatus: (status: LeadStatus) => void;
  isTransitionAllowed: (status: LeadStatus) => boolean;
}

export function StatusSelector({
  currentStatus,
  targetStatus,
  setTargetStatus,
  isTransitionAllowed
}: StatusSelectorProps) {
  if (!currentStatus) return null;
  
  return (
    <div className="space-y-2">
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
            const allowed = isTransitionAllowed(status);
            
            return (
              <SelectItem key={status} value={status}>
                {status} {!allowed && '(Not Allowed)'}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <div className="mt-2 text-xs">
        <span className="font-medium">
          {currentStatus === targetStatus 
            ? 'No change in status' 
            : isTransitionAllowed(targetStatus) 
              ? 'Valid transition' 
              : 'Invalid transition - will likely fail'}
        </span>
      </div>
    </div>
  );
}
