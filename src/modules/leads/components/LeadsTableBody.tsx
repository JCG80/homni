
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Lead, LeadStatus } from '../types/types';
import { LeadRow } from './LeadRow';

interface LeadsTableBodyProps {
  leads: Lead[];
  canChangeStatus: (lead: Lead, status: LeadStatus) => boolean;
  isAdmin: boolean;
  isCompany: boolean;
}

export const LeadsTableBody = ({ 
  leads, 
  canChangeStatus,
  isAdmin,
  isCompany
}: LeadsTableBodyProps) => {
  if (leads.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center py-4">
            Ingen leads funnet
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {leads.map((lead) => (
        <LeadRow 
          key={lead.id} 
          lead={lead} 
          canChangeStatus={canChangeStatus}
          isAdmin={isAdmin}
          isCompany={isCompany}
        />
      ))}
    </TableBody>
  );
};
