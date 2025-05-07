
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    return <div className="py-4 text-center">Laster inn...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Feil ved lasting av leads</AlertTitle>
        <AlertDescription>
          {(error as Error).message}
        </AlertDescription>
      </Alert>
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

      {leads.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-gray-500">Ingen leads funnet.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
