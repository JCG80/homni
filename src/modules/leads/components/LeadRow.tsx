import React from 'react';
import { Lead } from '@/types/leads';
import { LeadStatusBadge } from './LeadStatusBadge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useUpdateLeadStatus } from '../hooks/useLeads';

interface LeadRowProps {
  lead: Lead;
}

export const LeadRow: React.FC<LeadRowProps> = ({ lead }) => {
  const navigate = useNavigate();
  const { isAdmin, isCompany } = useAuth();
  const { updateStatus, isLoading: isUpdating } = useUpdateLeadStatus();

  const handleViewDetails = () => {
    navigate(`/leads/${lead.id}`);
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateStatus(lead.id, newStatus);
  };

  return (
    <tr>
      <td className="py-2 px-4 border-b">{lead.id}</td>
      <td className="py-2 px-4 border-b">{lead.title}</td>
      <td className="py-2 px-4 border-b">{lead.category}</td>
      <td className="py-2 px-4 border-b">{lead.description}</td>
      <td className="py-2 px-4 border-b">
        <LeadStatusBadge status={lead.status} />
      </td>
      <td className="py-2 px-4 border-b">
        {isAdmin && (
          <select
            value={lead.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="border rounded px-2 py-1"
            disabled={isUpdating}
          >
            <option value="new">Ny</option>
            <option value="in_progress">Under behandling</option>
            <option value="completed">Fullført</option>
            <option value="rejected">Avvist</option>
          </select>
        )}
        {isCompany && (
          <select
            value={lead.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="border rounded px-2 py-1"
            disabled={isUpdating}
          >
            <option value="new">Ny</option>
            <option value="in_progress">Under behandling</option>
            <option value="completed">Fullført</option>
            <option value="rejected">Avvist</option>
          </select>
        )}
      </td>
      <td className="py-2 px-4 border-b">
        <Button onClick={handleViewDetails} variant="secondary" size="sm">
          Se detaljer
        </Button>
      </td>
    </tr>
  );
};
