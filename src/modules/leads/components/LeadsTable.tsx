
import { useState } from 'react';
import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLeadList } from '../hooks/useLeads';
import { Lead, LeadStatus } from '../types/types';
import { isStatusTransitionAllowed } from '../utils/lead-utils';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadsFilterBar } from './LeadsFilterBar';
import { LeadsTableBody } from './LeadsTableBody';

interface LeadsTableProps {
  initialFilter?: {
    status?: LeadStatus;
    category?: string;
  };
}

export const LeadsTable = ({ initialFilter = {} }: LeadsTableProps) => {
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
  
  const { isAdmin, isCompany } = useAuth();

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
      <LeadsFilterBar
        initialStatusFilter={initialFilter.status}
        initialCategoryFilter={initialFilter.category}
        onStatusFilterChange={setStatusFilter}
        onCategoryFilterChange={setCategoryFilter}
      />

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
          <LeadsTableBody 
            leads={leads}
            canChangeStatus={canChangeStatus}
            isAdmin={isAdmin}
            isCompany={isCompany}
          />
        </Table>
      </div>
    </div>
  );
};
