
import React from 'react';
import { Lead, LeadStatus } from '@/types/leads';

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
  isAdmin = false,
  isCompany = false 
}) => {
  // This is a placeholder component that would typically render a lead row
  return (
    <tr>
      <td>{lead.title}</td>
      <td>{lead.category}</td>
      <td>{lead.status}</td>
      {showCompany && <td>{lead.company_id || 'Ikke tildelt'}</td>}
      <td>{new Date(lead.created_at).toLocaleDateString()}</td>
    </tr>
  );
};
