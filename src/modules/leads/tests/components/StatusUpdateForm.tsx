
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus, LEAD_STATUSES } from '../../types/types';

interface StatusUpdateFormProps {
  leadId: string;
  setLeadId: (id: string) => void;
  status: LeadStatus;
  setStatus: (status: LeadStatus) => void;
}

export function StatusUpdateForm({
  leadId,
  setLeadId,
  status,
  setStatus
}: StatusUpdateFormProps) {
  return (
    <>
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
            {LEAD_STATUSES.map((statusOption) => (
              <SelectItem key={statusOption} value={statusOption}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
