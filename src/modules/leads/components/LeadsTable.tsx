
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadStatusBadge } from './LeadStatusBadge';
import { useLeadList, useUpdateLeadStatus } from '../hooks/useLeads';
import { LeadStatus, LEAD_STATUSES, Lead } from '../types/types';
import { LEAD_CATEGORIES } from '../constants/lead-constants';
import { isStatusTransitionAllowed } from '../utils/lead-utils';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LeadsTableProps {
  initialFilter?: {
    status?: LeadStatus;
    category?: string;
  };
}

export const LeadsTable = ({ initialFilter = {} }: LeadsTableProps) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(
    initialFilter.status
  );
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    initialFilter.category
  );

  const { data: leads = [], isLoading, error } = useLeadList({
    status: statusFilter,
    category: categoryFilter,
  });
  
  const { mutate: updateStatus } = useUpdateLeadStatus();
  const { isAdmin, isCompany } = useAuth();

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateStatus(
      { leadId, status: newStatus },
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

  const canChangeStatus = (lead: Lead, status: LeadStatus) => {
    // Check permission based on role
    if (!isAdmin && !isCompany) return false;
    
    // Check if transition is allowed
    return isStatusTransitionAllowed(lead.status, status);
  };

  if (isLoading) {
    return <div>Laster inn...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Feil ved lasting av leads: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as LeadStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter på status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle statuser</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/3">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter på kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle kategorier</SelectItem>
              {LEAD_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Liste over alle leads</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Ingen leads funnet
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
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
                            handleStatusChange(lead.id, value as LeadStatus)
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
