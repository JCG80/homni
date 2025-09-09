
import { Lead, LeadStatus } from '@/types/leads-canonical';
import { ALLOWED_STATUS_TRANSITIONS, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '../constants/lead-constants';

// Check if status transition is allowed
export const isStatusTransitionAllowed = (
  currentStatus: LeadStatus, 
  newStatus: LeadStatus
): boolean => {
  if (currentStatus === newStatus) return true;
  
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions?.includes(newStatus) || false;
};

// Get status badge color
export const getStatusColor = (status: LeadStatus): string => {
  return LEAD_STATUS_COLORS[status] || 'bg-gray-500';
};

// Get human-readable status label in Norwegian
export const getStatusLabel = (status: LeadStatus): string => {
  return LEAD_STATUS_LABELS[status] || status;
};

// Sort leads by date (newest first)
export const sortLeadsByDate = (leads: Lead[]): Lead[] => {
  return [...leads].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

// Group leads by status
export const groupLeadsByStatus = (leads: Lead[]): Record<LeadStatus, Lead[]> => {
  const grouped = {} as Record<LeadStatus, Lead[]>;
  
  leads.forEach(lead => {
    if (!grouped[lead.status]) {
      grouped[lead.status] = [];
    }
    grouped[lead.status].push(lead);
  });
  
  return grouped;
};
