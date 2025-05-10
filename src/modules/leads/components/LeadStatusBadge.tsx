
import { LeadStatus } from '@/types/leads';
import { getStatusColor, getStatusLabel } from '../utils/lead-utils';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export const LeadStatusBadge = ({ status, className = '' }: LeadStatusBadgeProps) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const statusColor = getStatusColor(status);
  
  return (
    <span className={`${baseClasses} ${statusColor} text-white ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
};
