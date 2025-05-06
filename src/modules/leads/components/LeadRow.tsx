
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Lead, LeadStatus, LEAD_STATUSES } from '../types/types';
import { LeadStatusBadge } from './LeadStatusBadge';
import { isStatusTransitionAllowed } from '../utils/lead-utils';
import { useUpdateLeadStatus } from '../hooks/useLeads';

interface LeadRowProps {
  lead: Lead;
  canChangeStatus: (lead: Lead, status: LeadStatus) => boolean;
  isAdmin: boolean;
  isCompany: boolean;
}

export const LeadRow = ({ 
  lead, 
  canChangeStatus, 
  isAdmin, 
  isCompany 
}: LeadRowProps) => {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateLeadStatus();

  const handleStatusChange = (newStatus: LeadStatus) => {
    updateStatus(
      { leadId: lead.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status oppdatert',
            description: 'Lead-status har blitt oppdatert',
          });
        },
        onError: () => {
          toast({
            title: 'Feil',
            description: 'Kunne ikke oppdatere status',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <TableRow key={lead.id}>
      <TableCell className="font-medium">{lead.title}</TableCell>
      <TableCell>
        {lead.category.charAt(0).toUpperCase() + lead.category.slice(1)}
      </TableCell>
      <TableCell>
        <LeadStatusBadge status={lead.status} />
      </TableCell>
      <TableCell>
        {new Date(lead.created_at).toLocaleDateString('nb-NO')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {(isAdmin || isCompany) && (
            <Select
              disabled={!isAdmin && !isCompany}
              value={lead.status}
              onValueChange={(value) =>
                handleStatusChange(value as LeadStatus)
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Endre status" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    disabled={!canChangeStatus(lead, status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            Se detaljer
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
