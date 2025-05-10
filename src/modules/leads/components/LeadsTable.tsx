import React from 'react';
import { useLeadList } from '../hooks/useLeads';
import { formatDate } from '@/lib/utils';
import { LeadStatusBadge } from './LeadStatusBadge';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { CompanyLeadActions } from './CompanyLeadActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const LeadsTable = () => {
  const { data: leads = [], isLoading, refetch } = useLeadList();
  const { role } = useAuth();

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opprettet</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Laster inn...
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Ingen leads funnet.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.title}</TableCell>
                  <TableCell>{lead.category}</TableCell>
                  <TableCell>{lead.lead_type || 'general'}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>{formatDate(lead.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {role === 'company' && (
                      <CompanyLeadActions
                        leadId={lead.id}
                        currentStatus={lead.status}
                        onStatusUpdated={refetch}
                      />
                    )}
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
