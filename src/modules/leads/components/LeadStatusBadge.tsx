
import { LeadStatus, STATUS_EMOJI } from '@/types/leads';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-500',
  qualified: 'bg-purple-500',
  contacted: 'bg-amber-500',
  negotiating: 'bg-orange-500',
  converted: 'bg-green-500',
  lost: 'bg-red-500',
  paused: 'bg-gray-500',
};

export const LeadStatusBadge = ({ status, className = '' }: LeadStatusBadgeProps) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const statusColor = statusColors[status] || 'bg-gray-500';
  
  return (
    <span className={`${baseClasses} ${statusColor} text-white ${className}`}>
      {STATUS_EMOJI[status]}
    </span>
  );
};
