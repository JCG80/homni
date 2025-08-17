
import React from 'react';
import { LeadStatus, LEAD_STATUSES, STATUS_EMOJI } from '@/types/leads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadStatusSelectorProps {
  currentStatus: LeadStatus;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

export const LeadStatusSelector: React.FC<LeadStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  return (
    <Select 
      defaultValue={currentStatus} 
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Velg status" />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map(status => (
          <SelectItem key={status} value={status}>
            {STATUS_EMOJI[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
