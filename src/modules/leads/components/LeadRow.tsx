
import React from 'react';
import { Lead, LeadStatus } from '@/types/leads';
import { LeadStatusBadge } from './LeadStatusBadge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useUpdateLeadStatus } from '../hooks/useLeads';

export interface LeadRowProps {
  lead: Lead;
  showCompany?: boolean;
  canChangeStatus?: (lead: Lead, status: LeadStatus) => boolean;
  isAdmin?: boolean;
  isCompany?: boolean;
}

export const LeadRow: React.FC<LeadRowProps> = ({ 
  lead, 
  showCompany = false,
  canChangeStatus = () => true,
  isAdmin: propIsAdmin,
  isCompany: propIsCompany
}) => {
  const navigate = useNavigate();
  const { isAdmin: authIsAdmin, isCompany: authIsCompany } = useAuth();
  const { updateStatus, isLoading: isUpdating } = useUpdateLeadStatus();
  
  // Use props values if provided, otherwise fall back to auth context
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : authIsAdmin;
  const isCompany = propIsCompany !== undefined ? propIsCompany : authIsCompany;

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
      {showCompany && <td className="py-2 px-4 border-b">{lead.company_id}</td>}
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
